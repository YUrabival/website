console.log('orderRouter loaded');
import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

function hasRole(user: any): user is { id: string; role: string } {
  return user && typeof user === 'object' && 'role' in user && typeof user.role === 'string';
}

export const orderRouter = router({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      if (hasRole(ctx.session.user) && (ctx.session.user.role === 'admin' || ctx.session.user.role === 'manager')) {
        return ctx.db.order.findMany({
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      return ctx.db.order.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      if (!order) throw new Error('Order not found');
      if (!hasRole(ctx.session.user) || (ctx.session.user.role !== 'admin' && ctx.session.user.role !== 'manager' && order.userId !== ctx.session.user.id)) {
        throw new Error('Unauthorized');
      }

      return order;
    }),

  create: protectedProcedure
    .input(z.object({
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
      })),
      address: z.string(),
      phone: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const items = await Promise.all(
        input.items.map(async (item) => {
          const product = await ctx.db.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) throw new Error(`Product ${item.productId} not found`);
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return ctx.db.order.create({
        data: {
          userId: ctx.session.user.id,
          status: 'pending',
          addressId: input.address,
          total,
          items: {
            create: items,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!hasRole(ctx.session.user) || !['admin', 'manager'].includes(ctx.session.user.role?.toLowerCase?.())) {
          throw new Error('Unauthorized');
        }
        return await ctx.db.order.update({
          where: { id: input.id },
          data: { status: input.status },
        });
      } catch (err) {
        console.error('[order.updateStatus]', err);
        throw err;
      }
    }),
}); 