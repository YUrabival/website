"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { api } from "~/utils/api";
import { Product } from '@/types';

const sortOptions = [
  { label: 'По умолчанию', value: 'default' },
  { label: 'По возрастанию цены', value: 'price_asc' },
  { label: 'По убыванию цены', value: 'price_desc' },
  { label: 'По названию', value: 'name' },
];

interface Category {
  id: string;
  name: string;
}

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [category, setCategory] = useState(searchParams?.get('category') || '');
  const [sort, setSort] = useState(searchParams?.get('sort') || 'default');
  const [carBrand, setCarBrand] = useState(searchParams?.get('carBrand') || '');
  const [carModel, setCarModel] = useState(searchParams?.get('carModel') || '');

  // Получаем категории из tRPC
  const { data: categories = [], isLoading: isCategoriesLoading } = api.product.getCategories.useQuery();

  // Получаем товары через tRPC (или fetch/REST, если нужно)
  const { data: products = [], isLoading } = api.product.getAll.useQuery({
    categoryId: category || undefined,
    search: search || undefined,
    sort,
    carBrand: carBrand || undefined,
    carModel: carModel || undefined,
  });

  // Обновление query-параметров без перезагрузки
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort && sort !== 'default') params.set('sort', sort);
    if (carBrand) params.set('carBrand', carBrand);
    if (carModel) params.set('carModel', carModel);
    router.replace(`/catalog?${params.toString()}`);
    // eslint-disable-next-line
  }, [category, search, sort, carBrand, carModel]);

  return (
    <div className="container mx-auto px-4 py-10 flex gap-8">
      {/* Фильтры слева */}
      <aside className="w-72 shrink-0 hidden md:block">
        <div className="bg-gray-900 rounded-2xl p-6 sticky top-8">
          <h2 className="text-lg font-bold text-white mb-4">Фильтры</h2>
          <div className="mb-6">
            <div className="text-gray-400 text-xs mb-2">Подбор по автомобилю</div>
            <div className="flex flex-col gap-2 mb-2">
              <select
                className="rounded bg-gray-800 text-white px-2 py-1 w-full"
                value={carBrand}
                onChange={e => {
                  setCarBrand(e.target.value);
                  setCarModel("");
                }}
              >
                <option value="">Марка</option>
                <option value="Lada">Lada</option>
                <option value="UAZ">UAZ</option>
                <option value="GAZ">GAZ</option>
              </select>
              <select
                className="rounded bg-gray-800 text-white px-2 py-1 w-full"
                value={carModel}
                onChange={e => setCarModel(e.target.value)}
                disabled={!carBrand}
              >
                <option value="">Модель</option>
                {carBrand === "Lada" && <>
                  <option value="Granta">Granta</option>
                  <option value="Vesta">Vesta</option>
                  <option value="Niva">Niva</option>
                </>}
                {carBrand === "UAZ" && <>
                  <option value="Patriot">Patriot</option>
                </>}
                {carBrand === "GAZ" && <>
                  <option value="Gazelle">Gazelle</option>
                  <option value="Next">Next</option>
                </>}
              </select>
              {(carBrand || carModel) && (
                <button
                  className="text-xs text-blue-400 hover:underline text-left mt-1"
                  onClick={() => { setCarBrand(""); setCarModel(""); }}
                  type="button"
                >
                  Сбросить подбор по авто
                </button>
              )}
            </div>
            <Link href="/" className="text-blue-400 hover:underline text-sm">Выбрать автомобиль на главной странице</Link>
          </div>
          <div>
            <div className="text-gray-400 text-xs mb-2">Категории</div>
            {isCategoriesLoading ? (
              <div className="text-gray-400 text-sm py-2">Загрузка категорий...</div>
            ) : (
              <ul className="flex flex-col gap-1">
                <li key="all">
                  <button
                    className={`block w-full text-left px-3 py-2 rounded-lg transition text-white ${category === '' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                    onClick={() => setCategory('')}
                  >
                    Все категории
                  </button>
                </li>
                {categories.map((cat: Category) => (
                  <li key={cat.id}>
                    <button
                      className={`block w-full text-left px-3 py-2 rounded-lg transition text-white ${category === cat.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
      {/* Каталог товаров */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Все запчасти</h1>
          <span className="text-gray-400 text-sm">{products.length} товаров</span>
        </div>
        <div className="mb-8 flex gap-4 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск автозапчастей..."
            className="w-full rounded-lg bg-gray-900 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            autoComplete="off"
          />
          <select value={sort} onChange={e => setSort(e.target.value)} className="rounded bg-gray-800 text-white px-3 py-2">
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-4 text-center text-white">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400">Нет товаров</div>
          ) : (
            products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </main>
    </div>
  );
} 