import { Truck, Clock, MapPin } from "lucide-react";

export default function DeliveryPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c23] via-[#232b3b] to-[#181c23] overflow-hidden">
      {/* SVG паттерн/фон */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="700" cy="100" r="80" fill="#2563eb" fillOpacity="0.15" />
        <circle cx="100" cy="500" r="120" fill="#2563eb" fillOpacity="0.10" />
        <rect x="200" y="200" width="400" height="200" rx="100" fill="#2563eb" fillOpacity="0.07" />
      </svg>
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full bg-gray-900/90 rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-white mb-4 text-center">Доставка</h1>
          <p className="text-lg text-gray-300 text-center mb-4">Мы осуществляем быструю и надёжную доставку автозапчастей по всей России и странам СНГ. Ваш заказ будет обработан и отправлен в кратчайшие сроки.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400">
            <li>Доставка курьером по Москве и области — 1-2 дня</li>
            <li>Доставка по России — 2-7 дней (ТК СДЭК, Почта России, Boxberry и др.)</li>
            <li>Самовывоз из пунктов выдачи</li>
            <li>Возможность отслеживания заказа онлайн</li>
            <li>Бережная упаковка и гарантия целостности</li>
          </ul>
        </div>
        {/* Преимущества */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Truck className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Быстрая доставка</span>
            <span className="text-gray-400 text-sm text-center">Оперативная отправка и надёжные транспортные компании</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Clock className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Сроки — от 1 дня</span>
            <span className="text-gray-400 text-sm text-center">Большинство заказов доставляются в течение 1-3 дней</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <MapPin className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Пункты выдачи</span>
            <span className="text-gray-400 text-sm text-center">Более 3000 пунктов самовывоза по всей стране</span>
          </div>
        </div>
      </div>
    </div>
  );
} 