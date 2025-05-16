"use client";

import { useRouter } from 'next/navigation';
import { api } from "~/utils/api";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
  };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders = [] } = api.order.getAll.useQuery();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#23272f] rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-white">Мои заказы</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order: Order) => (
          <div key={order.id} className="bg-[#181a20] rounded-xl p-6 border border-[#23272f]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-[#b0b8c1]">Заказ #{order.id}</div>
                <div className="text-xs text-[#b0b8c1] mb-2">
                  {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-medium" 
                style={{
                  backgroundColor: order.status === 'completed' ? '#22c55e20' : 
                                 order.status === 'processing' ? '#3b82f620' : '#f59e0b20',
                  color: order.status === 'completed' ? '#22c55e' : 
                        order.status === 'processing' ? '#3b82f6' : '#f59e0b'
                }}>
                {order.status === 'completed' ? 'Выполнен' : 
                 order.status === 'processing' ? 'В обработке' : 'Ожидает оплаты'}
              </div>
            </div>
            
            <div className="space-y-3">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-[#23272f]">
                    <img
                      src={item.product.image ?? '/placeholder.jpg'}
                      alt={item.product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.product.name}</div>
                    <div className="text-sm text-[#b0b8c1]">{item.quantity} шт. × {item.price.toLocaleString()} ₽</div>
                  </div>
                  <div className="text-white font-medium">
                    {(item.quantity * item.price).toLocaleString()} ₽
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#23272f] flex justify-between items-center">
              <div className="text-sm text-[#b0b8c1]">
                {order.items.length} {order.items.length === 1 ? 'товар' : 'товара'}
              </div>
              <div className="text-lg font-semibold text-white">
                {order.total.toLocaleString()} ₽
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 