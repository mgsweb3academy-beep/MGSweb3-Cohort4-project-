import { auth } from '@/auth';
import { createConvexToken } from '@/lib/convex-token';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || (session.user as { status?: string }).status !== 'active') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return Response.json({ token: await createConvexToken(session.user.email, (session.user as { sessionVersion?: number }).sessionVersion) }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
