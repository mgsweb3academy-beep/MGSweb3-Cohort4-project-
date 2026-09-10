import { NextResponse } from 'next/server';
import { RegisterRequest, RegisterResponse, User } from 'types';
import { createUser, getUserByEmail } from '@/lib/auth-store';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: Request) {
  try {
    const body: RegisterRequest = await req.json();

    if (!body.email || !body.name || !body.password) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Email, name and password are required' } }, { status: 400 });
    }

    if (body.password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` } }, { status: 400 });
    }

    if (await getUserByEmail(body.email)) {
      return NextResponse.json({ error: { code: 'USER_EXISTS', message: 'A user with that email already exists.' } }, { status: 409 });
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

    const response: RegisterResponse = {
      token: `mock_jwt_token_new_${Date.now()}`,
      user,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } }, { status: 500 });
  }
}
