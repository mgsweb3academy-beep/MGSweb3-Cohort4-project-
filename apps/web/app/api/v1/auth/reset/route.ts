import { requestPasswordReset, resetPasswordWithToken } from '@/lib/auth-store';
export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON' } }, { status: 400 }); }
  if (!body || typeof body !== 'object') return Response.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }, { status: 400 });
  try {
    if (typeof body.token === 'string') {
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) return Response.json({ error: { code: 'BAD_REQUEST', message: 'Password must be at least 8 characters' } }, { status: 400 });
      const success = await resetPasswordWithToken(body.token, body.newPassword);
      return Response.json({ success }, { status: success ? 200 : 400 });
    }
    if (typeof body.email !== 'string') return Response.json({ error: { code: 'BAD_REQUEST', message: 'Email is required' } }, { status: 400 });
    await requestPasswordReset(body.email);
    return Response.json({ success: true, message: 'If the account is eligible, an email has been sent.' });
  } catch { return Response.json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Email service is unavailable' } }, { status: 503 }); }
}
