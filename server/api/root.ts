console.log('appRouter loaded');
import { router } from './trpc';
import { productRouter } from './routers/product';
import { orderRouter } from './routers/order';
import { userRouter } from './routers/user';
import { authRouter } from './routers/auth';

export const appRouter = router({
  product: productRouter,
  order: orderRouter,
  user: userRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter; 