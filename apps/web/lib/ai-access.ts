import 'server-only';
import { auth } from '@/auth';

export async function guardAI(roles?: string[], demoOnly = true) {
  const session = await auth();
  const user = session?.user as { status?: string; role?: string } | undefined;
  if (!user || user.status !== 'active') return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
  if (roles && !roles.includes(user.role ?? '')) return Response.json({ error: { code: 'FORBIDDEN', message: 'Permission denied' } }, { status: 403 });
  if (demoOnly && (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_AI !== 'true')) {
    return Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'This AI feature is not configured' } }, { status: 503 });
  }
  return null;
}
