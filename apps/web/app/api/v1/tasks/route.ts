// apps/web/app/api/v1/tasks/route.ts
// Part 5 — Task & Assignment Board
// GET  /api/v1/tasks   — paginated task list with filters
// POST /api/v1/tasks   — create a new task (instructor/admin only)
//
// Error shape: { error: { code, message } }
// Pagination: ?cursor= (offset-based against mock; real impl uses cursor into DB)

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_TASKS } from '@/lib/mock-data';
import type { Task, TaskState, TaskPriority } from '@/lib/types';

// In-memory store for mutations (dev-only mock; Part 14 replaces with real DB)
let taskStore: Task[] = [...MOCK_TASKS];

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cohortId  = searchParams.get('cohortId');
  const teamId    = searchParams.get('teamId');
  const state     = searchParams.get('state') as TaskState | null;
  const cursor    = parseInt(searchParams.get('cursor') ?? '0', 10);
  const limit     = Math.min(parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10), 100);

  let filtered = taskStore;
  if (cohortId) filtered = filtered.filter((t) => t.cohortId === cohortId);
  if (teamId)   filtered = filtered.filter((t) => t.teamId === teamId);
  if (state)    filtered = filtered.filter((t) => t.state === state);

  // Sort: open tasks by updatedAt desc, closed tasks last
  filtered = filtered.slice().sort((a, b) => {
    const aOpen = a.state !== 'Closed' ? 0 : 1;
    const bOpen = b.state !== 'Closed' ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const total    = filtered.length;
  const page     = filtered.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < total ? cursor + limit : undefined;

  return NextResponse.json({ tasks: page, nextCursor, total });
}

export async function POST(req: NextRequest) {
  // Role check — only instructor/admin may create tasks.
  // In production: read from verified JWT session (Part 2).
  // Mock: accept x-user-role header (set by middleware or Next-Auth session).
  const role = req.headers.get('x-user-role') ?? 'instructor';
  if (role === 'student') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Only instructors and admins can create tasks.' } },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const { title, teamId, teamName, cohortId, description, lessonId, lessonTitle, priority, dueDate } =
    body as Record<string, string>;

  if (!title?.trim() || !teamId || !cohortId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'title, teamId, and cohortId are required.' } },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: title.trim(),
    description: description?.trim(),
    teamId,
    teamName: teamName ?? teamId,
    cohortId,
    lessonId: lessonId || undefined,
    lessonTitle: lessonTitle?.trim() || undefined,
    state: 'Assigned',
    priority: (priority as TaskPriority) || 'medium',
    dueDate: dueDate || undefined,
    createdAt: now,
    updatedAt: now,
    transitions: [
      { from: null, to: 'Assigned', at: now, by: 'system', byName: 'System' },
    ],
  };

  taskStore = [newTask, ...taskStore];

  return NextResponse.json(newTask, { status: 201 });
}

// Export the mutable store so [id] routes can share it (dev mock pattern)
export { taskStore };
