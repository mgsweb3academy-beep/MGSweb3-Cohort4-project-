import { NextResponse } from 'next/server';
import { User } from 'types';
import { createUser, requestEmailVerification } from '@/lib/auth-store';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body.email !== 'string' || typeof body.name !== 'string' || typeof body.password !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || !body.name.trim()) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Email, name and password are required' } }, { status: 400 });
    }

    if (body.password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` } }, { status: 400 });
    }

    const userRecord = await createUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: 'student',
      provider: 'credentials',
    });

    if (!userRecord) {
      return NextResponse.json({ error: { code: 'USER_EXISTS', message: 'A user with that email already exists.' } }, { status: 409 });
    }

    const user: User = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      status: userRecord.status,
      joinedAt: userRecord.joinedAt,
      cohortIds: [],
    };

    let verificationSent = false;
    try { await requestEmailVerification(user.email); verificationSent = true; } catch { /* User can request verification again when mail is available. */ }
    const response = { user, verificationRequired: true, verificationSent };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON' } }, { status: 400 });
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } }, { status: 500 });
  }
}
