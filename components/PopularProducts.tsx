"use client";

import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import type { Product } from "@/types";
import { ProductCard } from './ProductCard';

export function PopularProducts({ minCols = 2 }: { minCols?: number }) {
  const { data: products = [], isLoading } = api.product.getPopular.useQuery();

  const gridCols = `grid-cols-1 sm:grid-cols-${minCols} lg:grid-cols-4`;

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-6`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return <div className="text-white text-center">Нет популярных товаров</div>;
  }

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}