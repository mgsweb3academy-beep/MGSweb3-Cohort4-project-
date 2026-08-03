import { NextRequest, NextResponse } from 'next/server';
import { createInstructorDraft, getInstructorDrafts } from '@/lib/ai-service';

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get('courseId') ?? 'crs1';
  return NextResponse.json({ drafts: getInstructorDrafts(courseId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseId, type, context } = body as { courseId?: string; type?: 'announcement' | 'rubric' | 'content_suggestion'; context?: string };

    if (!courseId || !type || !context?.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'courseId, type, and context are required.' } }, { status: 400 });
    }

    const draft = createInstructorDraft(courseId, type, context.trim());
    return NextResponse.json({ draft }, { status: 201 });
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body.' } }, { status: 400 });
  }
}
