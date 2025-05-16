"use client";

import { useCart } from "~/hooks/use-cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import Link from "next/link";

export default function CheckoutPage() {
  const cart = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'processing'|'success'>('processing');
  const [email, setEmail] = useState("");
  const { data: profile, isLoading: profileLoading } = api.user.getProfile.useQuery();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Redirect if not authenticated
  if (!session) {
    router.push('/login');
    return null;
  }

  // Redirect if cart is empty
  if (cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Автозаполнение email и адреса из профиля
  useEffect(() => {
    if (profile) {
      if (profile.email) setEmail(profile.email);
      // Выбираем основной адрес (isDefault) или первый
      const mainAddress = profile.addresses?.find((a: any) => a.isDefault) || profile.addresses?.[0];
      if (mainAddress) {
        setSelectedAddressId(mainAddress.id);
      }
    }
  }, [profile]);

  // Проверка подтверждения почты
  useEffect(() => {
    if (profile && !profile.emailVerified) {
      router.push('/profile?verifyEmail=1');
    }
  }, [profile, router]);

  const selectedAddress = profile?.addresses?.find((a: any) => a.id === selectedAddressId);
  console.log({ 
    selectedAddressId, 
    phone, 
    cart: cart.items, 
    sessionUserId: session?.user?.id, 
    addressUserId: selectedAddress?.userId, 
    address: selectedAddress 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setShowModal(true);
    setModalStep('processing');
    try {
      // Синхронизация корзины с сервером
      for (const item of cart.items) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
          }),
        });
      }
      console.log({ selectedAddressId, phone, cart: cart.items });
      if (!selectedAddressId) {
        setError('Выберите адрес доставки');
        setShowModal(false);
        setSubmitting(false);
        return;
      }
      if (!phone.trim()) {
        setError('Введите телефон');
        setShowModal(false);
        setSubmitting(false);
        return;
      }
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          phoneNumber: phone.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      setTimeout(() => {
        setModalStep('success');
        setTimeout(() => {
          cart.clearCart();
          router.push('/checkout/success');
        }, 1200);
      }, 1800);
    } catch {
      setError('Ошибка оформления заказа');
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dark:bg-gray-900 bg-white min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-8">Оформление заказа</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-6">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Ваш заказ</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product.image || "/no-image.png"}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium dark:text-white text-gray-900">{item.product.name}</h3>
                    <p className="text-sm dark:text-gray-400 text-gray-500">
                      {item.quantity ?? 1} шт. × {item.product.price.toLocaleString()} ₽
                    </p>
                  </div>
                  <div className="font-medium dark:text-white text-gray-900">
                    {(item.product.price * (item.quantity ?? 1)).toLocaleString()} ₽
                  </div>
                </div>
              ))}
              <div className="border-t dark:border-gray-700 border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="dark:text-white text-gray-900">Итого:</span>
                  <span className="dark:text-white text-gray-900">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-6">
            <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">Данные для доставки</h2>
            {profile && profile.addresses && profile.addresses.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border dark:border-gray-700 border-gray-300 py-2 px-4 dark:bg-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white opacity-70"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Адрес доставки
                  </label>
                  <select
                    id="address"
                    value={selectedAddressId}
                    onChange={e => setSelectedAddressId(e.target.value)}
                    required
                    className="w-full rounded-xl border dark:border-gray-700 border-gray-300 py-2 px-4 dark:bg-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  >
                    {profile.addresses.map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.street}, {a.city}, {a.state}, {a.postalCode}, {a.country}
                        {a.isDefault ? ' (основной)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
                    Телефон (необязательно)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-xl border dark:border-gray-700 border-gray-300 py-2 px-4 dark:bg-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'Оформление...' : 'Подтвердить заказ'}
                </Button>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="text-red-500">Нет ни одного адреса. <br/>Добавьте адрес в <Link href="/profile" className="underline text-blue-500">профиле</Link>!</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center min-w-[320px]">
            {modalStep === 'processing' && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-6"></div>
                <div className="text-white text-lg font-semibold mb-2">Подтверждение оплаты...</div>
              </>
            )}
            {modalStep === 'success' && (
              <>
                <div className="text-green-400 text-4xl mb-4">✓</div>
                <div className="text-white text-lg font-semibold mb-2">Заказ успешно оформлен!</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 