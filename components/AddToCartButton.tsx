'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 500);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={adding || product.stock === 0}
      className="w-full"
    >
      {adding
        ? 'Adding...'
        : product.stock === 0
        ? 'Out of Stock'
        : 'Add to Cart'}
    </Button>
  );
} 