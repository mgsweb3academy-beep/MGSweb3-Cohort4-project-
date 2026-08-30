import { NextRequest, NextResponse } from 'next/server';
import { getQuizQuestions, gradeQuizAttempt } from '@/lib/ai-service';

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get('lessonId');
  if (!lessonId) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'lessonId is required.' } }, { status: 400 });
  }

  return NextResponse.json({ questions: getQuizQuestions(lessonId) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, answers } = body as { lessonId?: string; answers?: Record<string, string> };
    if (!lessonId || !answers) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'lessonId and answers are required.' } }, { status: 400 });
    }

    const result = gradeQuizAttempt(lessonId, answers);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body.' } }, { status: 400 });
  }
}
