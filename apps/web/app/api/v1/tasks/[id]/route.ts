// apps/web/app/api/v1/tasks/[id]/route.ts
// Part 5 — Task & Assignment Board
// GET    /api/v1/tasks/[id]   — single task detail with full transition history
// PATCH  /api/v1/tasks/[id]   — update task metadata (title, desc, priority, dueDate)
// DELETE /api/v1/tasks/[id]   — soft-delete task (instructor/admin only)

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_TASKS } from '@/lib/mock-data';
import type { Task, TaskPriority } from '@/lib/types';

// Shared in-memory store (same reference as route.ts in parent)
// In production: Part 14's DB replaces this entirely.
let taskStore: Task[] = [...MOCK_TASKS];

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const task = taskStore.find((t) => t.id === id);
  if (!task) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Task "${id}" not found.` } },
      { status: 404 },
    );
  }
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const role = req.headers.get('x-user-role') ?? 'instructor';
  if (role === 'student') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Students cannot edit task metadata.' } },
      { status: 403 },
    );
  }

  const taskIndex = taskStore.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Task "${id}" not found.` } },
      { status: 404 },
    );
  }

  let body: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'lessonId' | 'lessonTitle'>>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const existing = taskStore[taskIndex];
  const updated: Task = {
    ...existing,
    title:       body.title?.trim()       ?? existing.title,
    description: body.description?.trim() ?? existing.description,
    priority:    (body.priority as TaskPriority) ?? existing.priority,
    dueDate:     body.dueDate             ?? existing.dueDate,
    lessonId:    body.lessonId            ?? existing.lessonId,
    lessonTitle: body.lessonTitle?.trim() ?? existing.lessonTitle,
    updatedAt:   new Date().toISOString(),
  };

  taskStore = [
    ...taskStore.slice(0, taskIndex),
    updated,
    ...taskStore.slice(taskIndex + 1),
  ];

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const role = req.headers.get('x-user-role') ?? 'instructor';
  if (role === 'student') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Students cannot delete tasks.' } },
      { status: 403 },
    );
  }

  const taskIndex = taskStore.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Task "${id}" not found.` } },
      { status: 404 },
    );
  }

  taskStore = taskStore.filter((t) => t.id !== id);
  return new NextResponse(null, { status: 204 });
}
