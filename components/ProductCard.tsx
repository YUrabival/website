'use client';

import { Product } from '@/types';
import { AddToCartButton } from './AddToCartButton';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border dark:bg-gray-900 bg-white shadow-lg hover:shadow-xl transition-all duration-300 relative">
      <Link
        href={`/product/${product.id}`}
        className="block relative aspect-square w-full"
        tabIndex={-1}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-lg dark:text-white text-gray-900 flex-1 line-clamp-1">{product.name}</h3>
          {product.brand?.name && (
            <span className="text-xs bg-gray-800 text-white rounded px-2 py-0.5 font-semibold">
              {product.brand.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        <div className="mt-auto flex flex-col gap-2">
          <span className="text-2xl font-bold text-white mb-2">{product.price.toLocaleString()} ₽</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
} 