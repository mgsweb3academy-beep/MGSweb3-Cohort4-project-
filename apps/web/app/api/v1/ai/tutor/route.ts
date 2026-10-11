import { guardAI } from '@/lib/ai-access';
import { authenticatedConvex } from '@/lib/convex-server';
import { api } from '@/convex/_generated/api';
import { apiError } from '@/lib/api-error';

export async function POST(req: Request) {
  const denied = await guardAI(undefined, false);
  if (denied) return denied;
  try {
    const { lessonId, question } = await req.json();
    if (typeof lessonId !== 'string' || typeof question !== 'string' || !question.trim() || question.length > 4000) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'A lesson and question of at most 4000 characters are required' } }, { status: 400 });
    const lesson = await (await authenticatedConvex()).query(api.lessons.get, { id: lessonId });
    if (!lesson) return Response.json({ error: { code: 'NOT_FOUND', message: 'Lesson not found' } }, { status: 404 });
    const serviceUrl = process.env.AI_SERVICE_URL;
    if (!serviceUrl) return Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'Tutor service is not configured' } }, { status: 503 });
    let response;
    try {
      response = await fetch(`${serviceUrl}/v1/tutor/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: 'tutor', action: 'ask', payload: { lessonId, question: question.trim(), lessonContext: lesson.textContent ?? '' } }), signal: AbortSignal.timeout(30000) });
    } catch { return Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'Tutor service is unavailable' } }, { status: 503 }); }
    if (!response.ok) return Response.json({ error: { code: 'AI_UNAVAILABLE', message: 'Tutor could not answer this question' } }, { status: response.status === 503 ? 503 : 502 });
    const answer = await response.json();
    return Response.json({ id: crypto.randomUUID(), lessonId, lessonTitle: lesson.title, question, answer: answer.answer, confidence: answer.confidence, evidence: [{ lessonId, lessonTitle: lesson.title, excerpt: lesson.textContent ?? '' }], createdAt: new Date().toISOString() });
  } catch (error) { return apiError(error); }
}
