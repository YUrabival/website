export default function WarrantyPage() {
  return (
    <div className="dark:bg-[#101014] bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-white mb-8">Гарантия качества</h1>
        <div className="bg-[#181a20] rounded-2xl p-6 shadow-lg border border-[#23272f] text-[#b0b8c1] text-lg">
          <h2 className="text-xl font-bold text-white mb-4">Гарантия на товары</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>На все товары предоставляется официальная гарантия производителя</li>
            <li>Срок гарантии — от 6 до 24 месяцев в зависимости от категории товара</li>
            <li>Гарантийные обязательства действуют на всей территории России</li>
          </ul>
          <h2 className="text-xl font-bold text-white mb-4 mt-6">Возврат и обмен</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Вы можете вернуть или обменять товар в течение 14 дней после получения</li>
            <li>Товар должен быть в оригинальной упаковке и без следов эксплуатации</li>
            <li>Для возврата необходим чек или иной документ, подтверждающий покупку</li>
          </ul>
          <p>Если у вас возникли вопросы по гарантии или возврату, свяжитесь с нашей службой поддержки — мы всегда готовы помочь!</p>
        </div>
      </div>
    </div>
  );
} 