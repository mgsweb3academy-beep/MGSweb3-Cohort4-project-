import { NextResponse } from 'next/server';
import { verifyPassword, getUserByEmail } from '@/lib/auth-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Email and password are required' } }, { status: 400 });
    }

    const user = verifyPassword(email, password);
    if (!user) {
      const existing = getUserByEmail(email);
      if (existing?.status === 'suspended') {
        return NextResponse.json({ error: { code: 'ACCOUNT_SUSPENDED', message: 'This account has been suspended.' } }, { status: 403 });
      }

      return NextResponse.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } }, { status: 401 });
    }

    return NextResponse.json({
      token: `mock-jwt-${user.id}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        githubUsername: user.githubUsername,
        cohortIds: user.cohortIds,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }, { status: 400 });
  }
}
