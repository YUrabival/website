import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { useCart } from "~/hooks/use-cart";
import Link from "next/link";
import { Star } from 'lucide-react';
import { api } from "~/utils/api";
import { prisma } from '@/lib/prisma';
import { Product } from '@/types';
import { AddToCartButton } from '@/components/AddToCartButton';
import { ProductCard } from '@/components/ProductCard';

interface ProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    // include: {
    //   category: true,
    //   brand: true,
    //   compatibilities: {
    //     include: {
    //       vehicle: true,
    //     },
    //   },
    // },
  });

  if (!product) return null;

  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    // category: product.category ? {
    //   id: product.category.id,
    //   name: product.category.name,
    //   description: product.category.description || undefined,
    // } : undefined,
    // brand: product.brand ? {
    //   id: product.brand.id,
    //   name: product.brand.name,
    //   description: product.brand.description || undefined,
    // } : undefined,
    // compatibilities: product.compatibilities.map(c => ({
    //   id: c.id,
    //   productId: c.productId,
    //   vehicleId: c.vehicleId,
    //   vehicle: {
    //     id: c.vehicle.id,
    //     make: c.vehicle.make,
    //     model: c.vehicle.model,
    //     year: c.vehicle.year,
    //     engine: c.vehicle.engine || undefined,
    //   },
    // })),
  };
}

async function getSimilarProducts(product: Product): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
  });
  return products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const similarProducts = await getSimilarProducts(product);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs bg-blue-600 text-white rounded px-2 py-0.5 font-semibold">
              {product.brandId}
            </span>
            <span className="text-xs bg-gray-700 text-white rounded px-2 py-0.5 font-semibold">
              {product.categoryId}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">{product.name}</h1>
          <div className="text-3xl font-bold text-blue-400 mb-4">{product.price.toLocaleString()} ₽</div>
          <div className="text-gray-300 text-lg mb-4">{product.description}</div>
          <div className="flex flex-col gap-2 text-gray-400 text-base mb-4">
            <div><span className="font-semibold text-white">Артикул:</span> {product.partNumber}</div>
            <div><span className="font-semibold text-white">В наличии:</span> {product.stock}</div>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Похожие товары</h2>
        {similarProducts.length === 0 ? (
          <div className="text-gray-400">Нет похожих товаров</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 