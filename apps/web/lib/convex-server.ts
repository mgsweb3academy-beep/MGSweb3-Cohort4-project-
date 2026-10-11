import 'server-only';
import { ConvexHttpClient } from 'convex/browser';
import { auth } from '@/auth';
import { createConvexToken } from './convex-token';

export async function authenticatedConvex() {
  const session = await auth();
  if (!session?.user?.email || (session.user as { status?: string }).status !== 'active') {
    throw new Error('UNAUTHORIZED');
  }
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
  const client = new ConvexHttpClient(url);
  client.setAuth(await createConvexToken(session.user.email, (session.user as { sessionVersion?: number }).sessionVersion));
  return client;
}
