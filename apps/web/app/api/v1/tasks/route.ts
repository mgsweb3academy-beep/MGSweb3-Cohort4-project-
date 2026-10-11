import { api } from '@/convex/_generated/api';
import { authenticatedConvex } from '@/lib/convex-server';
import { apiError } from '@/lib/api-error';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = await authenticatedConvex();
    const params = req.nextUrl.searchParams;
    const cursor = Number(params.get('cursor') ?? 0);
    const limit = Number(params.get('limit') ?? 20);
    const state = params.get('state') ?? undefined;
    if (!Number.isInteger(cursor) || cursor < 0 || !Number.isInteger(limit) || limit < 1 || (state && !['Assigned','Branched','Pushed','In Review','Closed'].includes(state))) {
      return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid filters or pagination' } }, { status: 400 });
    }
    return Response.json(await client.query(api.tasks.list, { cohortId: params.get('cohortId') ?? undefined, teamId: params.get('teamId') ?? undefined, state: state as 'Assigned' | 'Branched' | 'Pushed' | 'In Review' | 'Closed' | undefined, cursor, limit }));
  } catch (error) { return apiError(error); }
}

export async function POST(req: Request) {
  try {
    const client = await authenticatedConvex();
    const body = await req.json();
    if (!body || typeof body.title !== 'string' || typeof body.teamId !== 'string' || typeof body.cohortId !== 'string') return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Title, teamId and cohortId are required' } }, { status: 400 });
    const { title, description, teamId, teamName, cohortId, lessonId, lessonTitle, priority, dueDate } = body;
    return Response.json(await client.mutation(api.tasks.create, { title, description, teamId, teamName: teamName ?? teamId, cohortId, lessonId, lessonTitle, priority, dueDate }), { status: 201 });
  } catch (error) { return apiError(error); }
}
