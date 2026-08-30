// apps/web/app/api/v1/tasks/[id]/transition/route.ts
// Part 5 — Task & Assignment Board
// POST /api/v1/tasks/[id]/transition
//
// Advances or reopens a task's state. This is the authoritative state-machine
// enforcement point. Parts 6, 7, and 8 call this endpoint to drive task state.
//
// Body: { to: TaskState, by: string, byName: string }
//
// Rules:
//   - State can only move forward through the five defined states.
//   - No skipping: Assigned → Pushed is not valid.
//   - "reopen" (Closed → Assigned) is the only backward path.
//   - Every transition is logged with timestamp, actor id, and actor name.
//   - Returns 400 with INVALID_TRANSITION code for any illegal move.

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_TASKS } from '@/lib/mock-data';
import type { Task, TaskState, TaskTransition } from '@/lib/types';

/** Canonical forward-only transitions. Matches task-service.ts — update both together. */
const VALID_TRANSITIONS: Record<TaskState, TaskState[]> = {
  'Assigned':    ['Branched'],
  'Branched':    ['Pushed'],
  'Pushed':      ['In Review'],
  'In Review':   ['Closed'],
  'Closed':      ['Assigned'],   // reopen only
};

let taskStore: Task[] = [...MOCK_TASKS];

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: { to?: string; by?: string; byName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const { to, by, byName } = body;
  if (!to || !by || !byName) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '`to`, `by`, and `byName` are required.' } },
      { status: 400 },
    );
  }

  const taskIndex = taskStore.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Task "${id}" not found.` } },
      { status: 404 },
    );
  }

  const task = taskStore[taskIndex];
  const allowed = VALID_TRANSITIONS[task.state] ?? [];

  if (!allowed.includes(to as TaskState)) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition task from "${task.state}" to "${to}". Allowed: ${allowed.join(', ') || 'none'}.`,
        },
      },
      { status: 400 },
    );
  }

  const newState = to as TaskState;
  const now      = new Date().toISOString();

  const transition: TaskTransition = {
    from:   task.state,
    to:     newState,
    at:     now,
    by:     by,
    byName: byName,
  };

  const updatedTask: Task = {
    ...task,
    state:     newState,
    updatedAt: now,
    closedAt:  newState === 'Closed' ? now : task.closedAt,
    transitions: [...task.transitions, transition],
  };

  // If this is a reopen, clear closedAt
  if (newState === 'Assigned' && task.state === 'Closed') {
    updatedTask.closedAt = undefined;
  }

  taskStore = [
    ...taskStore.slice(0, taskIndex),
    updatedTask,
    ...taskStore.slice(taskIndex + 1),
  ];

  return NextResponse.json(updatedTask);
}
