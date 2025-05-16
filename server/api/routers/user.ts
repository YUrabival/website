console.log('userRouter loaded');
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { sendVerificationEmail } from "~/server/email";
import { addMinutes } from 'date-fns';

function hasRole(user: any): user is { id: string; role: string } {
  return user && typeof user === 'object' && 'role' in user && typeof user.role === 'string';
}

export const userRouter = router({
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          addresses: true,
          emailVerified: true,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  sendVerificationEmail: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      if (!user) throw new Error('User not found');
      // Генерируем код
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      // Сохраняем код и срок действия
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          verificationCode: code,
          verificationCodeExpires: addMinutes(new Date(), 30),
        },
      });
      await sendVerificationEmail(user.email ?? '', code);
      return { success: true };
    }),

  verifyEmail: protectedProcedure
    .input(z.any()) // временно для диагностики
    .mutation(async ({ ctx, input }) => {
      console.log('verifyEmail mutation input:', input, typeof input);
      const code = Array.isArray(input) ? input[0] : input;
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      if (!user) throw new Error('User not found');
      console.log('=== VERIFY EMAIL DEBUG ===');
      console.log('user.verificationCode:', user.verificationCode);
      console.log('input (code):', code);
      console.log('verificationCodeExpires:', user.verificationCodeExpires);
      console.log('now:', new Date());
      if (!user.verificationCode || !user.verificationCodeExpires) throw new Error('No code sent');
      if (user.verificationCode !== code) throw new Error('Неверный код');
      if (new Date() > user.verificationCodeExpires) throw new Error('Код истёк');
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationCode: null,
          verificationCodeExpires: null,
        },
      });
      return { success: true };
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      if (!hasRole(ctx.session.user) || ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    }),

  updateRole: protectedProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(['user', 'manager', 'admin']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!hasRole(ctx.session.user) || ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!hasRole(ctx.session.user) || ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      return ctx.db.user.delete({
        where: { id: input },
      });
    }),
}); 