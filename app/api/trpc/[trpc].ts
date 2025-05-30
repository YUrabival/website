import { appRouter } from '@/server/api/root';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from '@/server/api/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST }; 