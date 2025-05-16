console.log('authRouter loaded');
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';

export const authRouter = router({
  getSession: publicProcedure
    .query(async () => {
      const session = await getServerSession(authOptions);
      return session;
    }),
}); 