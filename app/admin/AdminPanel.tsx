"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  stock: number;
  categoryId: string;
  brandId: string;
  partNumber: string;
  carBrand: string;
  carModel: string;
}

interface ProductForm {
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  categoryId: string;
  brandId: string;
  partNumber: string;
  carBrand: string;
  carModel: string;
}

export default function AdminPanel() {
  const [userSort, setUserSort] = useState<'name'|'email'|'role'>('name');
  const [userSortDir, setUserSortDir] = useState<'asc'|'desc'>('asc');
  const [productSort, setProductSort] = useState<'name'|'price'|'createdAt'>('name');
  const [productSortDir, setProductSortDir] = useState<'asc'|'desc'>('asc');
  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const { data: users = [], refetch: refetchUsers } = api.user.getAll.useQuery();
  const { data: products = [], refetch: refetchProducts } = api.product.getAll.useQuery({
    sort: productSort === 'price' ? (productSortDir === 'asc' ? 'price_asc' : 'price_desc') :
          productSort === 'name' ? (productSortDir === 'asc' ? 'name_asc' : 'name_desc') :
          undefined,
    search: productSearch || undefined,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    price: 0,
    description: '',
    image: '',
    stock: 0,
    categoryId: '',
    brandId: '',
    partNumber: '',
    carBrand: '',
    carModel: '',
  });
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<ProductForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const utils = api.useContext();
  const deleteProductMutation = api.product.delete.useMutation({
    onSuccess: () => {
      utils.product.getAll.invalidate();
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  });

  // Сортировка и фильтрация пользователей на клиенте
  const sortedUsers = [...users]
    .filter(u => (u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())))
    .sort((a, b) => {
      let cmp = 0;
      if (userSort === 'name') cmp = (a.name ?? '').localeCompare(b.name ?? '');
      if (userSort === 'email') cmp = (a.email ?? '').localeCompare(b.email ?? '');
      if (userSort === 'role') cmp = (a.role ?? '').localeCompare(b.role ?? '');
      return userSortDir === 'asc' ? cmp : -cmp;
    });

  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find((u: User) => u.id === userId);
    if (!user) return;
    const res = await fetch(`/api/users?id=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        name: user.name,
        email: user.email,
        role: newRole.toUpperCase(),
        phone: user.phone ?? "",
        address: user.address ?? ""
      }),
    });
    if (res.ok) {
      await refetchUsers();
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteId(productId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteId) return;
    setLoading(true);
    await deleteProductMutation.mutateAsync(deleteId);
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await refetchProducts();
      setShowAddModal(false);
      setForm({
        name: '', price: 0, description: '', image: '', stock: 0, categoryId: '', brandId: '', partNumber: '', carBrand: '', carModel: ''
      });
    }
    setLoading(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image || '',
      stock: product.stock || 0,
      categoryId: product.categoryId || '',
      brandId: product.brandId || '',
      partNumber: product.partNumber || '',
      carBrand: product.carBrand || '',
      carModel: product.carModel || '',
    });
    setEditId(product.id);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editId) return;
    setLoading(true);
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editId, ...editForm }),
    });
    if (res.ok) {
      await refetchProducts();
      setShowEditModal(false);
      setEditForm(null);
      setEditId(null);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="products">Товары</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4 flex flex-col gap-2">
            <input
              className="bg-gray-800 text-white rounded px-2 py-1 w-full max-w-xs"
              placeholder="Поиск по имени или email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
            <div className="flex gap-2 items-center">
              <span className="text-sm">Сортировать по:</span>
              <select className="bg-gray-700 text-white rounded px-2 py-1" value={userSort} onChange={e => setUserSort(e.target.value as any)}>
                <option value="name">Имя</option>
                <option value="email">Email</option>
                <option value="role">Роль</option>
              </select>
              <button className="ml-2 px-2 py-1 rounded bg-gray-700 text-white" onClick={() => setUserSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                {userSortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {sortedUsers.map((user: User) => (
              <div key={user.id} className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="bg-gray-700 text-white rounded px-2 py-1"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="USER">Пользователь</option>
                    <option value="MANAGER">Менеджер</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="products">
          <div className="mb-4 flex flex-col gap-2">
            <input
              className="bg-gray-800 text-white rounded px-2 py-1 w-full max-w-xs"
              placeholder="Поиск по названию или описанию..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
            />
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="text-sm">Сортировать по:</span>
                <select className="bg-gray-700 text-white rounded px-2 py-1" value={productSort} onChange={e => setProductSort(e.target.value as any)}>
                  <option value="name">Название</option>
                  <option value="price">Цена</option>
                  <option value="createdAt">Дата</option>
                </select>
                <button className="ml-2 px-2 py-1 rounded bg-gray-700 text-white" onClick={() => setProductSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                  {productSortDir === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              <Button onClick={() => setShowAddModal(true)}>Добавить товар</Button>
            </div>
          </div>
          <div className="space-y-4">
            {products.map((product: Product) => (
              <div key={product.id} className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-gray-400">{product.price} ₽</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>Редактировать</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>Удалить</Button>
                </div>
              </div>
            ))}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-xl w-full max-w-lg space-y-4">
                  <h2 className="text-xl font-bold mb-2">Добавить товар</h2>
                  <input required placeholder="Название" className="w-full border px-3 py-2 rounded" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <input required type="number" placeholder="Цена" className="w-full border px-3 py-2 rounded" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                  <input required placeholder="Описание" className="w-full border px-3 py-2 rounded" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  <input required placeholder="URL картинки" className="w-full border px-3 py-2 rounded" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                  <input required type="number" placeholder="В наличии (шт)" className="w-full border px-3 py-2 rounded" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} />
                  <input required placeholder="ID категории" className="w-full border px-3 py-2 rounded" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} />
                  <input required placeholder="ID бренда" className="w-full border px-3 py-2 rounded" value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} />
                  <input required placeholder="Артикул" className="w-full border px-3 py-2 rounded" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} />
                  <input placeholder="Марка авто" className="w-full border px-3 py-2 rounded" value={form.carBrand} onChange={e => setForm(f => ({ ...f, carBrand: e.target.value }))} />
                  <input placeholder="Модель авто" className="w-full border px-3 py-2 rounded" value={form.carModel} onChange={e => setForm(f => ({ ...f, carModel: e.target.value }))} />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Отмена</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Добавление...' : 'Добавить'}</Button>
                  </div>
                </form>
              </div>
            )}
            {showEditModal && editForm && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <form onSubmit={handleUpdateProduct} className="bg-white p-8 rounded-xl w-full max-w-lg space-y-4">
                  <h2 className="text-xl font-bold mb-2">Редактировать товар</h2>
                  <input required placeholder="Название" className="w-full border px-3 py-2 rounded" value={editForm.name} onChange={e => setEditForm(f => f ? { ...f, name: e.target.value } : f)} />
                  <input required type="number" placeholder="Цена" className="w-full border px-3 py-2 rounded" value={editForm.price} onChange={e => setEditForm(f => f ? { ...f, price: +e.target.value } : f)} />
                  <input required placeholder="Описание" className="w-full border px-3 py-2 rounded" value={editForm.description} onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)} />
                  <input required placeholder="URL картинки" className="w-full border px-3 py-2 rounded" value={editForm.image} onChange={e => setEditForm(f => f ? { ...f, image: e.target.value } : f)} />
                  <input required type="number" placeholder="В наличии (шт)" className="w-full border px-3 py-2 rounded" value={editForm.stock} onChange={e => setEditForm(f => f ? { ...f, stock: +e.target.value } : f)} />
                  <input required placeholder="ID категории" className="w-full border px-3 py-2 rounded" value={editForm.categoryId} onChange={e => setEditForm(f => f ? { ...f, categoryId: e.target.value } : f)} />
                  <input required placeholder="ID бренда" className="w-full border px-3 py-2 rounded" value={editForm.brandId} onChange={e => setEditForm(f => f ? { ...f, brandId: e.target.value } : f)} />
                  <input required placeholder="Артикул" className="w-full border px-3 py-2 rounded" value={editForm.partNumber} onChange={e => setEditForm(f => f ? { ...f, partNumber: e.target.value } : f)} />
                  <input placeholder="Марка авто" className="w-full border px-3 py-2 rounded" value={editForm.carBrand} onChange={e => setEditForm(f => f ? { ...f, carBrand: e.target.value } : f)} />
                  <input placeholder="Модель авто" className="w-full border px-3 py-2 rounded" value={editForm.carModel} onChange={e => setEditForm(f => f ? { ...f, carModel: e.target.value } : f)} />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Отмена</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</Button>
                  </div>
                </form>
              </div>
            )}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl w-full max-w-md flex flex-col items-center gap-4">
                  <h2 className="text-xl font-bold mb-2 text-center">Удалить товар?</h2>
                  <p className="text-gray-700 text-center">Вы уверены, что хотите удалить этот товар? Это действие необратимо.</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
                    <Button type="button" variant="destructive" onClick={confirmDeleteProduct} disabled={loading}>{loading ? 'Удаление...' : 'Удалить'}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 