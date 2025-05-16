import { initTRPC, TRPCError } from '@trpc/server';
import { prisma as db } from '@/lib/prisma';
import { getServerSession, authOptions } from '@/lib/auth';

export type Context = {
  session: any;
  db: typeof db;
};

export const createContext = async (): Promise<Context> => {
  const session = await getServerSession(authOptions);
  return { session, db };
};

const t = initTRPC.context<Context>().create();

function hasUser(session: any): session is { user: { id: string } } {
  return session && typeof session === 'object' && 'user' in session && session.user && typeof session.user.id === 'string';
}

const isAuthed = t.middleware(async ({ ctx, next }) => {
  console.log('isAuthed middleware');
  const session = ctx.session;
  if (!hasUser(session)) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { session, db: ctx.db } });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed); 