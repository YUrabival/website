import { ShieldCheck, Truck, Award } from "lucide-react";

export default function AboutPage() {
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
          <h1 className="text-3xl font-extrabold text-white mb-4 text-center">О компании</h1>
          <p className="text-lg text-gray-300 text-center mb-4">AutoPartsExpress — это современный интернет-магазин автозапчастей для автомобилей российского автопрома. Мы предлагаем только качественные детали от проверенных производителей с быстрой доставкой по всей России.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400">
            <li>Огромный выбор запчастей для Lada, УАЗ, ГАЗ и других отечественных марок</li>
            <li>Гарантия качества на все товары</li>
            <li>Профессиональная поддержка и консультации</li>
            <li>Удобный подбор по авто и категориям</li>
            <li>Выгодные цены и акции для постоянных клиентов</li>
          </ul>
        </div>
        {/* Преимущества */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <ShieldCheck className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Гарантия качества</span>
            <span className="text-gray-400 text-sm text-center">Только сертифицированные детали и проверенные бренды</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Truck className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Быстрая доставка</span>
            <span className="text-gray-400 text-sm text-center">Оперативная отправка по всей России и СНГ</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Award className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Премиальный сервис</span>
            <span className="text-gray-400 text-sm text-center">Профессиональная поддержка и индивидуальный подход</span>
          </div>
        </div>
      </div>
    </div>
  );
} 