import { NextRequest, NextResponse } from 'next/server';
import { createTutorAnswer } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, question } = body as { lessonId?: string; question?: string };

    if (!lessonId || !question?.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'lessonId and question are required.' } }, { status: 400 });
    }

    const result = createTutorAnswer(lessonId, question.trim());
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body.' } }, { status: 400 });
  }
}
