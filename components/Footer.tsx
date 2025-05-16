import Link from "next/link";
import { api } from "~/utils/api";

export function Footer() {
  const { data: categories = [] } = api.product.getCategories.useQuery();
  return (
    <footer className="dark:bg-gray-900 bg-white border-t dark:border-gray-800 border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">О компании</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AutoPartsExpress - ваш надежный партнер в мире автозапчастей. Мы предлагаем качественные детали для российских автомобилей с быстрой доставкой по всей России.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/catalog?category=${cat.id}`} className="text-sm text-muted-foreground hover:text-primary">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-sm text-muted-foreground hover:text-primary">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/payment" className="text-sm text-muted-foreground hover:text-primary">
                  Оплата
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-sm text-muted-foreground hover:text-primary">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                Телефон: +7 (999) 123-45-67
              </li>
              <li className="text-sm text-muted-foreground">
                Email: info@autopartsexpress.ru
              </li>
              <li className="text-sm text-muted-foreground">
                Адрес: г. Москва, ул. Примерная, д. 123
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AutoPartsExpress. Все права защищены.
        </div>
      </div>
    </footer>
  );
} 