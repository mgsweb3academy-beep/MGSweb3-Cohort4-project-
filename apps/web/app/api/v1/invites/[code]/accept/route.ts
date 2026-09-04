import { NextResponse } from 'next/server';
import { InviteAcceptResponse } from '@repo/types';
import { acceptInvite, getInviteByCode } from '@/lib/auth-store';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Code is required' } }, { status: 400 });
    }

    const invite = getInviteByCode(code);
    if (!invite) {
      return NextResponse.json({ error: { code: 'INVITE_NOT_FOUND', message: 'Invite not found.' } }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const userId = body?.userId ?? 'student1';
    const response = acceptInvite(code, userId);

    if (!response.success) {
      return NextResponse.json({ error: { code: 'INVITE_REJECTED', message: response.error } }, { status: 403 });
    }

    const inviteResponse: InviteAcceptResponse = {
      success: true,
      cohortId: response.cohortId,
      enrollmentId: response.enrollmentId,
    };

    return NextResponse.json(inviteResponse);
  } catch (error) {
    return NextResponse.json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' } }, { status: 500 });
  }
}
