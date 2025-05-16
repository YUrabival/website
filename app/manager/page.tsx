"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import { api } from "~/utils/api";

interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: { id: string; name: string; price: number; quantity: number; product: { name: string } }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: { id: string; name: string };
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

export default function ManagerPage() {
  const { data: session } = useSession();
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = api.order.getAll.useQuery();
  const { data: products = [], isLoading: productsLoading, error: productsError } = api.product.getAll.useQuery({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '', price: 0, description: '', image: '', stock: 0, categoryId: '', brandId: '', partNumber: '', carBrand: '', carModel: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<ProductForm | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const utils = api.useContext();
  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => utils.order.getAll.invalidate(),
  });
  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => utils.product.getAll.invalidate(),
  });
  const updateProduct = api.product.update.useMutation({
    onSuccess: () => utils.product.getAll.invalidate(),
  });
  const [sortField, setSortField] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
    });
  }, [products, sortField, sortOrder]);
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(product => product.name.toLowerCase().includes(search.toLowerCase()));
  }, [sortedProducts, search]);

  if (!session || session.user.role?.toUpperCase() !== "MANAGER") {
    return <div className="min-h-screen flex items-center justify-center dark:bg-[#101014] bg-white text-2xl text-red-500">Доступ запрещён</div>;
  }

  if (ordersLoading || productsLoading) {
    return <div className="dark:bg-[#101014] bg-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold text-white mb-8">Панель менеджера</h1>
      <div className="text-[#b0b8c1]">Загрузка...</div>
    </div>;
  }

  if (ordersError || productsError) {
    return <div className="dark:bg-[#101014] bg-white min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-extrabold text-white mb-8">Панель менеджера</h1>
      <div className="text-red-500 mb-4">Ошибка загрузки данных</div>
    </div>;
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' });
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteId(productId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
    setShowDeleteModal(false);
    setDeleteId(null);
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
      const newProduct = await res.json();
      // setProducts(products => [newProduct, ...products]);
      setShowAddModal(false);
      setForm({ name: '', price: 0, description: '', image: '', stock: 0, categoryId: '', brandId: '', partNumber: '', carBrand: '', carModel: '' });
    }
    setLoading(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: (product as any).description || '',
      image: (product as any).image || '',
      stock: (product as any).stock || 0,
      categoryId: (product as any).categoryId || '',
      brandId: (product as any).brandId || '',
      partNumber: (product as any).partNumber || '',
      carBrand: (product as any).carBrand || '',
      carModel: (product as any).carModel || '',
    });
    setEditId(product.id);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editId) return;
    setLoading(true);
    await updateProduct.mutateAsync({ id: editId, ...editForm });
    setShowEditModal(false);
    setEditForm(null);
    setEditId(null);
    setLoading(false);
  };

  return (
    <div className="dark:bg-[#101014] bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-8">Панель менеджера</h1>
        {/* {error && <div className="text-red-500 mb-4">{error}</div>} */}
        <div className="flex flex-col gap-12">
          {/* Заказы */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Заказы</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-[#181a20] rounded-xl overflow-hidden">
                <thead>
                  <tr className="text-[#b0b8c1] text-left">
                    <th className="px-4 py-2">Номер</th>
                    <th className="px-4 py-2">Дата</th>
                    <th className="px-4 py-2">Статус</th>
                    <th className="px-4 py-2">Сумма</th>
                    <th className="px-4 py-2">Состав</th>
                    <th className="px-4 py-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: Order) => (
                    <tr key={order.id} className="border-b border-[#23272f]">
                      <td className="px-4 py-2 text-white">{order.id}</td>
                      <td className="px-4 py-2 text-[#b0b8c1]">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')}
                          className="rounded-lg bg-[#23272f] text-white px-2 py-1"
                        >
                          <option value="pending">Ожидает</option>
                          <option value="processing">Обрабатывается</option>
                          <option value="shipped">В пути</option>
                          <option value="delivered">Готово</option>
                          <option value="cancelled">Отменён</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-white">{order.total.toLocaleString()} ₽</td>
                      <td className="px-4 py-2 text-[#b0b8c1]">
                        <ul className="list-disc pl-4">
                          {order.items.map(item => (
                            <li key={item.id}>{item.product.name} — {item.quantity} шт.</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Товары (CRUD) */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Товары</h2>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => setShowAddModal(true)}>Добавить товар</button>
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded px-2 py-1 border border-gray-600 bg-[#181a20] text-white"
                style={{ minWidth: 200 }}
              />
              <div className="flex items-center gap-2">
                <span className="text-white">Сортировать:</span>
                <select value={sortField} onChange={e => setSortField(e.target.value as 'name' | 'price')} className="rounded px-2 py-1">
                  <option value="name">По названию</option>
                  <option value="price">По цене</option>
                </select>
                <button className="px-2 py-1 rounded bg-gray-700 text-white" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {filteredProducts.map((product: Product) => (
                <div key={product.id} className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-gray-400">{product.price} ₽</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => handleEditProduct(product)}>Редактировать</button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => handleDeleteProduct(product.id)}>Удалить</button>
                  </div>
                </div>
              ))}
              {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <form onSubmit={handleAddProduct} className="bg-[#181a20] p-8 rounded-xl w-full max-w-lg space-y-4">
                    <h2 className="text-xl font-bold mb-2 text-white">Добавить товар</h2>
                    <input required placeholder="Название" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    <input required type="number" placeholder="Цена" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                    <input required placeholder="Описание" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    <input required placeholder="URL картинки" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
                    <input required type="number" placeholder="В наличии (шт)" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} />
                    <input required placeholder="ID категории" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} />
                    <input required placeholder="ID бренда" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} />
                    <input required placeholder="Артикул" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} />
                    <input placeholder="Марка авто" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.carBrand} onChange={e => setForm(f => ({ ...f, carBrand: e.target.value }))} />
                    <input placeholder="Модель авто" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={form.carModel} onChange={e => setForm(f => ({ ...f, carModel: e.target.value }))} />
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowAddModal(false)}>Отмена</button>
                      <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={loading}>{loading ? 'Добавление...' : 'Добавить'}</button>
                    </div>
                  </form>
                </div>
              )}
              {showEditModal && editForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <form onSubmit={handleUpdateProduct} className="bg-[#181a20] p-8 rounded-xl w-full max-w-lg space-y-4">
                    <h2 className="text-xl font-bold mb-2 text-white">Редактировать товар</h2>
                    <input required placeholder="Название" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.name} onChange={e => setEditForm(f => f ? { ...f, name: e.target.value } : f)} />
                    <input required type="number" placeholder="Цена" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.price} onChange={e => setEditForm(f => f ? { ...f, price: +e.target.value } : f)} />
                    <input required placeholder="Описание" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.description} onChange={e => setEditForm(f => f ? { ...f, description: e.target.value } : f)} />
                    <input required placeholder="URL картинки" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.image} onChange={e => setEditForm(f => f ? { ...f, image: e.target.value } : f)} />
                    <input required type="number" placeholder="В наличии (шт)" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.stock} onChange={e => setEditForm(f => f ? { ...f, stock: +e.target.value } : f)} />
                    <input required placeholder="ID категории" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.categoryId} onChange={e => setEditForm(f => f ? { ...f, categoryId: e.target.value } : f)} />
                    <input required placeholder="ID бренда" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.brandId} onChange={e => setEditForm(f => f ? { ...f, brandId: e.target.value } : f)} />
                    <input required placeholder="Артикул" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.partNumber} onChange={e => setEditForm(f => f ? { ...f, partNumber: e.target.value } : f)} />
                    <input placeholder="Марка авто" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.carBrand} onChange={e => setEditForm(f => f ? { ...f, carBrand: e.target.value } : f)} />
                    <input placeholder="Модель авто" className="w-full border border-[#23272f] bg-[#23272f] text-white placeholder-gray-400 px-3 py-2 rounded" value={editForm.carModel} onChange={e => setEditForm(f => f ? { ...f, carModel: e.target.value } : f)} />
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowEditModal(false)}>Отмена</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
                    </div>
                  </form>
                </div>
              )}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-[#181a20] p-8 rounded-xl w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-white">Удалить товар?</h2>
                    <p className="mb-6 text-gray-300">Вы уверены, что хотите удалить этот товар? Это действие необратимо.</p>
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setShowDeleteModal(false)}>Отмена</button>
                      <button type="button" className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDeleteProduct} disabled={deleteProduct.isPending}>{deleteProduct.isPending ? 'Удаление...' : 'Удалить'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 