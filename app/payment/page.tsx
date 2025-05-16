import { CreditCard, ShieldCheck, Banknote } from "lucide-react";

export default function PaymentPage() {
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
          <h1 className="text-3xl font-extrabold text-white mb-4 text-center">Оплата</h1>
          <p className="text-lg text-gray-300 text-center mb-4">Мы предлагаем удобные и безопасные способы оплаты для вашего комфорта. Все платежи защищены современными технологиями шифрования.</p>
          <ul className="list-disc pl-6 mb-4 text-gray-400">
            <li>Банковская карта (Visa, MasterCard, МИР)</li>
            <li>Система быстрых платежей (СБП)</li>
            <li>Apple Pay / Google Pay</li>
            <li>Безналичный расчет для юридических лиц</li>
          </ul>
        </div>
        {/* Преимущества */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <CreditCard className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Удобная оплата</span>
            <span className="text-gray-400 text-sm text-center">Все популярные способы оплаты для вашего удобства</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <ShieldCheck className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Безопасность</span>
            <span className="text-gray-400 text-sm text-center">Платежи защищены SSL и проходят через сертифицированные шлюзы</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Banknote className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Для бизнеса</span>
            <span className="text-gray-400 text-sm text-center">Безналичный расчет и закрывающие документы для юр. лиц</span>
          </div>
        </div>
      </div>
    </div>
  );
} 