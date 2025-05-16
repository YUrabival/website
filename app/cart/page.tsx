"use client";

import { useCart } from "~/hooks/use-cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function CartPage() {
  const cart = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const handleCheckout = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (cart.items.length === 0) {
    return (
      <div className="dark:bg-gray-900 bg-white min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-8">Корзина</h1>
          <div className="dark:text-gray-400 text-gray-500 text-lg text-center">Ваша корзина пуста</div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="dark:bg-gray-900 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-8">Корзина</h1>
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-6">
            {cart.items.map((item) => (
              <li key={item.id} className="dark:bg-gray-800 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-4 flex flex-col sm:flex-row gap-6 items-center">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={item.product.image || "/no-image.png"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <Link href={`/product/${item.product.id}`} className="font-semibold dark:text-white text-gray-900 text-lg hover:text-blue-700 text-left">
                    {item.product.name}
                  </Link>
                  <div className="dark:text-gray-400 text-gray-500 text-sm text-left">
                    Цена: <span className="font-medium dark:text-white text-gray-900">{item.product.price.toLocaleString()} ₽</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <label htmlFor={`quantity-${item.product.id}`} className="text-sm dark:text-gray-300 text-gray-700">Количество:</label>
                    <select
                      id={`quantity-${item.product.id}`}
                      name={`quantity-${item.product.id}`}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        if (newQuantity === 0) {
                          cart.removeItem(item.product.id);
                        } else {
                          cart.updateQuantity(item.product.id, newQuantity);
                        }
                      }}
                      className="rounded-xl border dark:border-gray-700 border-gray-300 py-2 px-4 dark:bg-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    >
                      <option value="0">Удалить</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-6 flex flex-col gap-6">
            <div className="flex justify-between text-lg">
              <span className="dark:text-gray-300 text-gray-700">Итого:</span>
              <span className="font-semibold dark:text-white text-gray-900">
                {totalPrice.toLocaleString()} ₽
              </span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full text-lg py-4 mt-2"
            >
              {session ? 'Оформить заказ' : 'Войти для оформления'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 