import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очистка существующих данных
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.vehicleCompatibility.deleteMany(),
    prisma.product.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.address.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Создание пользователей
  const adminPassword = await hash('admin123', 12);
  const userPassword = await hash('user123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Regular User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
    },
  });

  // Создание транспортных средств
  const toyotaCamry = await prisma.vehicle.create({
    data: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      engine: '2.5L 4-Cylinder',
    },
  });

  const hondaCivic = await prisma.vehicle.create({
    data: {
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      engine: '1.5L Turbo',
    },
  });

  // --- Российские автомобили ---
  const ladaVesta = await prisma.vehicle.create({ data: { make: 'Lada', model: 'Vesta', year: 2022 } });
  const ladaGranta = await prisma.vehicle.create({ data: { make: 'Lada', model: 'Granta', year: 2021 } });
  const uazPatriot = await prisma.vehicle.create({ data: { make: 'UAZ', model: 'Patriot', year: 2020 } });
  const gazelle = await prisma.vehicle.create({ data: { make: 'GAZ', model: 'Gazelle', year: 2019 } });
  const renaultLogan = await prisma.vehicle.create({ data: { make: 'Renault', model: 'Logan', year: 2021 } });

  // --- Категории ---
  const categories = [
    'Тормозная система',
    'Подвеска',
    'Двигатель',
    'Электрика',
    'Фильтры',
    'Кузов',
  ];

  // --- Бренды ---
  const brands = ['Lada', 'UAZ', 'GAZ', 'Renault', 'Bosch', 'Finwhale', 'Trialli'];

  // --- Категории ---
  const categoryObjs = await Promise.all(categories.map(name => prisma.category.create({ data: { name } })));
  // --- Бренды ---
  const brandObjs = await Promise.all(brands.map(name => prisma.brand.create({ data: { name } })));
  // --- Массовое создание товаров ---
  const vehicles = [ladaVesta, ladaGranta, uazPatriot, gazelle, renaultLogan];
  let productCount = 1;
  for (const category of categoryObjs) {
    for (const brand of brandObjs) {
      for (const vehicle of vehicles) {
        for (let i = 0; i < 3; i++) {
          const product = await prisma.product.create({
            data: {
              name: `${category.name} ${brand.name} ${vehicle.make} ${vehicle.model} #${productCount}`,
              description: `Качественная запчасть для ${vehicle.make} ${vehicle.model} (${category.name}, бренд ${brand.name})`,
              price: 2000 + Math.floor(Math.random() * 10000),
              stock: 10 + Math.floor(Math.random() * 50),
              categoryId: category.id,
              brandId: brand.id,
              partNumber: `${brand.name.slice(0,3).toUpperCase()}-${category.name.slice(0,3).toUpperCase()}-${productCount}`,
              image: `/demo/${(productCount % 6) + 1}.jpg`,
              carBrand: vehicle.make,
              carModel: vehicle.model,
            },
          });
          await prisma.vehicleCompatibility.create({
            data: {
              productId: product.id,
              vehicleId: vehicle.id,
            },
          });
          productCount++;
        }
      }
    }
  }

  // Создание адресов
  await prisma.address.create({
    data: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isDefault: true,
      userId: user.id,
    },
  });

  await prisma.address.create({
    data: {
      street: '456 Admin Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
      isDefault: true,
      userId: admin.id,
    },
  });

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 