import { NextRequest, NextResponse } from 'next/server';
import { MOCK_TASKS } from '@/lib/mock-data';
import type { Task, TaskReview, TaskTransition } from '@/lib/types';
import crypto from 'crypto';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

  let body: { reviewerId?: string; reviewerName?: string; status?: 'approved' | 'changes_requested'; comment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const { reviewerId, reviewerName, status, comment } = body;
  if (!reviewerId || !reviewerName || !status || !comment) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '`reviewerId`, `reviewerName`, `status`, and `comment` are required.' } },
      { status: 400 },
    );
  }

  if (status !== 'approved' && status !== 'changes_requested') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '`status` must be either "approved" or "changes_requested".' } },
      { status: 400 },
    );
  }

  const taskIndex = MOCK_TASKS.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Task "${id}" not found.` } },
      { status: 404 },
    );
  }

  const task = MOCK_TASKS[taskIndex];

  if (task.state !== 'In Review') {
    return NextResponse.json(
      { error: { code: 'INVALID_STATE', message: 'Reviews can only be added when task is In Review.' } },
      { status: 400 },
    );
  }

  const newReview: TaskReview = {
    id: `rev-${crypto.randomBytes(4).toString('hex')}`,
    taskId: task.id,
    reviewerId,
    reviewerName,
    status,
    comment,
    createdAt: new Date().toISOString(),
  };

  if (!task.reviews) {
    task.reviews = [];
  }
  task.reviews.push(newReview);

  // If changes are requested, revert task state to 'Pushed' per Part 7 spec
  if (status === 'changes_requested') {
    const now = new Date().toISOString();
    const transition: TaskTransition = {
      from: task.state,
      to: 'Pushed',
      at: now,
      by: reviewerId,
      byName: reviewerName,
    };
    task.state = 'Pushed';
    task.updatedAt = now;
    task.transitions.push(transition);
  }

  return NextResponse.json({ task, review: newReview }, { status: 201 });
}
