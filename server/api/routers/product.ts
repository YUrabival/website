console.log('productRouter loaded');
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import type { Context } from '../trpc';

export const productRouter = router({
  getAll: publicProcedure
    .input(z.object({
      categoryId: z.string().optional(),
      search: z.string().optional(),
      sort: z.string().optional(),
      carBrand: z.string().optional(),
      carModel: z.string().optional(),
    }))
    .query(async (opts: { ctx: Context; input: any }) => {
      const { ctx, input } = opts;
      const where: any = {
        ...(input.categoryId && { categoryId: input.categoryId }),
        ...(input.carBrand && { carBrand: input.carBrand }),
        ...(input.carModel && { carModel: input.carModel }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search } },
            { description: { contains: input.search } },
          ],
        }),
      };
      let orderBy: any = { createdAt: 'desc' };
      if (input.sort === 'price_asc') orderBy = { price: 'asc' };
      if (input.sort === 'price_desc') orderBy = { price: 'desc' };
      if (input.sort === 'name_asc') orderBy = { name: 'asc' };
      if (input.sort === 'name_desc') orderBy = { name: 'desc' };
      const [brands, categories] = await Promise.all([
        ctx.db.brand.findMany(),
        ctx.db.category.findMany(),
      ]);
      const brandMap = Object.fromEntries(brands.map(b => [b.id, b.name]));
      const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
      const products = await ctx.db.product.findMany({
        where,
        orderBy,
      });
      return products.map(p => ({
        ...p,
        brand: { id: p.brandId, name: brandMap[p.brandId] || '' },
        category: { id: p.categoryId, name: categoryMap[p.categoryId] || '' },
      }));
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async (opts: { ctx: Context; input: string }) => {
      const { ctx, input } = opts;
      return ctx.db.product.findUnique({
        where: { id: input },
        include: {
          compatibilities: {
            include: { vehicle: true }
          }
        }
      });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      image: z.string(),
      categoryId: z.string(),
      brandId: z.string(),
      partNumber: z.string(),
      stock: z.number(),
      carBrand: z.string().optional(),
      carModel: z.string().optional(),
    }))
    .mutation(async (opts: { ctx: Context; input: any }) => {
      const { ctx, input } = opts;
      return ctx.db.product.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          image: input.image,
          categoryId: input.categoryId,
          brandId: input.brandId,
          partNumber: input.partNumber,
          stock: input.stock,
          carBrand: input.carBrand ?? '',
          carModel: input.carModel ?? '',
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      image: z.string().optional(),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      stock: z.number().optional(),
      carBrand: z.string().optional(),
      carModel: z.string().optional(),
    }))
    .mutation(async (opts: { ctx: Context; input: any }) => {
      const { ctx, input } = opts;
      const { id, ...data } = input;
      return ctx.db.product.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async (opts: { ctx: Context; input: string }) => {
      const { ctx, input } = opts;
      return ctx.db.product.delete({
        where: { id: input },
      });
    }),

  getPopular: publicProcedure.query(async (opts: { ctx: Context }) => {
    console.log('getPopular START');
    const { ctx } = opts;
    console.log('getPopular called');
    try {
      const products = await ctx.db.product.findMany({
        take: 12,
        orderBy: { createdAt: "desc" }
      });
      console.log('products:', products);
      return products;
    } catch (error) {
      console.error('getPopular error:', error);
      throw new Error('Ошибка получения популярных товаров: ' + (error as Error).message);
    }
  }),

  getCategories: publicProcedure.query(async (opts: { ctx: Context }) => {
    const { ctx } = opts;
    const categories = await ctx.db.category.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    return categories;
  }),
}); 