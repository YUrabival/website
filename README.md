# AutoPartsExpress

Интернет-магазин автозапчастей для российских автомобилей.

## Технологии

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- NextAuth.js

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/autopartsexpress.git
cd autopartsexpress
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл .env.local и добавьте необходимые переменные окружения:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

4. Запустите проект в режиме разработки:
```bash
npm run dev
```

## Функциональность

- Каталог товаров с фильтрацией и поиском
- Корзина покупок
- Авторизация пользователей
- Личный кабинет
- История заказов
- Админ-панель

## Структура проекта

```
├── app/                # Страницы приложения
├── components/         # React компоненты
├── hooks/             # React хуки
├── lib/               # Утилиты и конфигурация
├── public/            # Статические файлы
└── types/             # TypeScript типы
```

## Лицензия

MIT
