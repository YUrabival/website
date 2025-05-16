'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from './CartItem';
import { useRouter } from 'next/navigation';

export function CartSheet() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <>
      <SheetHeader>
        <SheetTitle>Cart ({items.length})</SheetTitle>
      </SheetHeader>
      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <CartItem key={item.id} product={item.product} quantity={item.quantity} />
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                clearCart();
              }}
            >
              Clear Cart
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                router.push('/checkout');
              }}
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </>
  );
} 