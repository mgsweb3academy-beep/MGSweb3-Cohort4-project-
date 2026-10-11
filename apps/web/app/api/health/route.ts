import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export async function GET(request: Request) {
  const probe = new URL(request.url).searchParams.get('probe') ?? 'liveness';
  const headers = { 'Cache-Control': 'no-store' };
  if (probe === 'liveness') return Response.json({ status: 'UP', probe, timestamp: new Date().toISOString() }, { headers });
  if (probe !== 'readiness') return Response.json({ error: 'Unknown probe' }, { status: 400, headers });
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const authConfigured = !!(process.env.AUTH_SECRET && process.env.AUTH_URL && process.env.CONVEX_AUTH_PRIVATE_KEY);
  let database = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (url) {
      const client = new ConvexHttpClient(url);
      await Promise.race([client.query(api.health.check, {}), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timeout')), 3000); })]);
      database = true;
    }
  } catch { database = false; } finally { clearTimeout(timer); }
  const ready = database && authConfigured;
  return Response.json({ status: ready ? 'READY' : 'DEGRADED', probe, subsystems: { database: database ? 'UP' : 'DOWN', authentication: authConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED' }, timestamp: new Date().toISOString() }, { status: ready ? 200 : 503, headers });
}
