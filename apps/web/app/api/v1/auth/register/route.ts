import { NextResponse } from 'next/server';
import { RegisterRequest, RegisterResponse, User } from '@/lib/types';
import { createUser, getUserByEmail } from '@/lib/auth-store';

export async function POST(req: Request) {
  try {
    const body: RegisterRequest = await req.json();

    if (!body.email || !body.name) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Email and Name are required' } }, { status: 400 });
    }

    if (getUserByEmail(body.email)) {
      return NextResponse.json({ error: { code: 'USER_EXISTS', message: 'A user with that email already exists.' } }, { status: 409 });
    }

    const userRecord = createUser({
      email: body.email,
      password: body.password || 'changeme',
      name: body.name,
      role: 'student',
      provider: 'credentials',
    });

    const user: User = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      status: userRecord.status,
      joinedAt: userRecord.joinedAt,
      cohortIds: userRecord.cohortIds,
      githubUsername: userRecord.githubUsername,
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
