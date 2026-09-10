import { NextResponse } from 'next/server';
import { requestEmailVerification, verifyEmailToken } from '@/lib/auth-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, token } = body;

    if (token) {
      const success = await verifyEmailToken(token);
      return NextResponse.json({ success });
    }

    if (!email) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Email is required' } }, { status: 400 });
    }

    const result = await requestEmailVerification(email);
    return NextResponse.json({ success: !!result, token: result?.token });
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }, { status: 400 });
  }
}
