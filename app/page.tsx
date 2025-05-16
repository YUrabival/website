"use client";
import { PopularProducts } from "@/components/PopularProducts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/utils/api";

export default function HomePage() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const { data: categories = [] } = api.product.getCategories.useQuery();

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 min-h-screen w-full">
      {/* Hero + подбор по авто */}
      <section className="w-full pt-8 pb-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 text-center">Качественные автозапчасти</h1>
          <p className="text-lg text-gray-300 mb-8 text-center">Для российских автомобилей с быстрой доставкой</p>
          <form
            className="w-full max-w-3xl bg-gray-900 rounded-2xl p-6 flex flex-col md:flex-row gap-4 shadow-lg mb-6"
            onSubmit={e => {
              e.preventDefault();
              if (!brand || !model) return;
              router.push(`/catalog?carBrand=${encodeURIComponent(brand)}&carModel=${encodeURIComponent(model)}`);
            }}
          >
            <select
              className="rounded-lg p-3 bg-gray-800 text-white flex-1"
              value={brand}
              onChange={e => {
                setBrand(e.target.value);
                setModel("");
              }}
            >
              <option value="">Выберите марку</option>
              <option value="Lada">Lada</option>
              <option value="UAZ">UAZ</option>
              <option value="GAZ">GAZ</option>
            </select>
            <select
              className="rounded-lg p-3 bg-gray-800 text-white flex-1"
              value={model}
              onChange={e => setModel(e.target.value)}
              disabled={!brand}
            >
              <option value="">Выберите модель</option>
              {brand === "Lada" && <>
                <option value="Granta">Granta</option>
                <option value="Vesta">Vesta</option>
                <option value="Niva">Niva</option>
              </>}
              {brand === "UAZ" && <>
                <option value="Patriot">Patriot</option>
              </>}
              {brand === "GAZ" && <>
                <option value="Gazelle">Gazelle</option>
                <option value="Next">Next</option>
              </>}
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition"
              disabled={!brand || !model}
            >
              Подобрать запчасти
            </button>
          </form>
        </div>
      </section>

      {/* Преимущества */}
      <section className="w-full py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="text-blue-500 text-4xl mb-2">🛡️</div>
            <div className="font-bold text-white mb-1 text-lg">Гарантия качества</div>
            <div className="text-gray-400 text-sm">Все запчасти проходят строгий контроль качества</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="text-blue-500 text-4xl mb-2">⚡</div>
            <div className="font-bold text-white mb-1 text-lg">Быстрый подбор</div>
            <div className="text-gray-400 text-sm">Удобный поиск по названию и категориям</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 text-center flex flex-col items-center">
            <div className="text-blue-500 text-4xl mb-2">🚚</div>
            <div className="font-bold text-white mb-1 text-lg">Доставка по России</div>
            <div className="text-gray-400 text-sm">Быстрая доставка в любой регион страны</div>
          </div>
        </div>
      </section>

      {/* Популярные российские автомобили */}
      <section className="w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">Популярные российские автомобили</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚗</span>
              <span className="text-white font-medium">Lada Granta</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚙</span>
              <span className="text-white font-medium">UAZ Patriot</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚐</span>
              <span className="text-white font-medium">GAZ Gazelle</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚕</span>
              <span className="text-white font-medium">Lada Vesta</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚚</span>
              <span className="text-white font-medium">GAZ Next</span>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl mb-2">🚘</span>
              <span className="text-white font-medium">Lada Niva</span>
            </div>
          </div>
        </div>
      </section>

      {/* Категории запчастей */}
      <section className="w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-4">Категории запчастей</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                className="bg-gray-800 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Популярные товары */}
      <section className="w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Популярные товары</h2>
            <Link href="/catalog" className="text-blue-400 hover:underline text-sm">Смотреть все</Link>
          </div>
          <PopularProducts minCols={2} />
        </div>
      </section>
    </div>
  );
} 