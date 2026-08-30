// apps/web/lib/task-service.ts
// Part 5 — Task & Assignment Board
// Client-side service for all task operations.
// State-machine enforcement is duplicated here for immediate UI feedback;
// the API route is the authoritative check.

import type { Task, TaskState, TaskPriority, TaskTransition } from './types';


// ─── State machine ────────────────────────────────────────────────────────────

/**
 * Valid forward transitions from each state.
 * 'Closed' → 'Assigned' is the only backward path (reopen).
 * No skipping: Assigned → Pushed is not allowed.
 */
const VALID_TRANSITIONS: Record<TaskState, TaskState[]> = {
  Assigned:    ['Branched'],
  Branched:    ['Pushed'],
  Pushed:      ['In Review'],
  'In Review': ['Closed'],
  Closed:      ['Assigned'], // reopen only
};

/**
 * Pure validation function — identical logic lives in the API route.
 * Returns null on success; an error string on failure.
 */
export function validateTransition(from: TaskState, to: TaskState): string | null {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    const isReopen = from === 'Closed' && to === 'Assigned';
    if (!isReopen) {
      return `Cannot transition from "${from}" to "${to}". Allowed next states: ${allowed.join(', ') || 'none'}.`;
    }
  }
  return null;
}

/**
 * Returns true if moving from → to is a "reopen" (backward) action.
 */
export function isReopen(from: TaskState, to: TaskState): boolean {
  return from === 'Closed' && to === 'Assigned';
}

/**
 * Returns available next states for a task, given its current state.
 */
export function getAvailableTransitions(state: TaskState): TaskState[] {
  return VALID_TRANSITIONS[state] ?? [];
}

// ─── Time-in-state helpers ────────────────────────────────────────────────────

/**
 * Returns a human-readable label for how long a task has been in its
 * current state. Used for "in review · 3d" labels in the board.
 */
export function formatTimeInState(updatedAt: string): string {
  const ms = Date.now() - new Date(updatedAt).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor(ms / (1000 * 60));
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/**
 * A task is "stalled" if it has been In Review for more than the
 * threshold (default 3 days, configurable per cohort per Part 7 spec).
 */
export function isStalledInReview(task: Task, thresholdDays = 3): boolean {
  if (task.state !== 'In Review') return false;
  const ms = Date.now() - new Date(task.updatedAt).getTime();
  return ms > thresholdDays * 24 * 60 * 60 * 1000;
}

// ─── API fetch helpers ────────────────────────────────────────────────────────

export interface TaskFilters {
  cohortId?: string;
  teamId?: string;
  state?: TaskState;
  cursor?: string;
  limit?: number;
}

export interface TasksResponse {
  tasks: Task[];
  nextCursor?: string;
  total: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  teamId: string;
  teamName: string;
  cohortId: string;
  lessonId?: string;
  lessonTitle?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  lessonId?: string;
  lessonTitle?: string;
}

export interface TransitionPayload {
  to: TaskState;
  by: string;      // 'system' | 'manager' | userId
  byName: string;  // display name
}

// ─── Task operations ──────────────────────────────────────────────────────────

/** List tasks with optional filters. Paginated via cursor. */
export async function getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
  const params = new URLSearchParams();
  if (filters.cohortId) params.set('cohortId', filters.cohortId);
  if (filters.teamId) params.set('teamId', filters.teamId);
  if (filters.state) params.set('state', filters.state);
  if (filters.cursor) params.set('cursor', filters.cursor);
  if (filters.limit) params.set('limit', String(filters.limit));

  const res = await fetch(`/api/v1/tasks?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Failed to fetch tasks');
  }
  return res.json();
}

/** Fetch a single task by ID including full transition history. */
export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`/api/v1/tasks/${id}`);
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Task not found');
  }
  return res.json();
}

/** Create a new task. Returns the created task. */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch('/api/v1/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Failed to create task');
  }
  return res.json();
}

/** Update task metadata (title, description, priority, dueDate). */
export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`/api/v1/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Failed to update task');
  }
  return res.json();
}

/**
 * Transition a task to a new state.
 * Validates locally first for immediate feedback, then calls the API.
 * The API is the authoritative check — this is a convenience guard only.
 */
export async function transitionTask(
  task: Task,
  payload: TransitionPayload,
): Promise<Task> {
  const validationError = validateTransition(task.state, payload.to);
  if (validationError) {
    throw new Error(validationError);
  }

  const res = await fetch(`/api/v1/tasks/${task.id}/transition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Transition failed');
  }
  return res.json();
}

/** Soft-delete a task. Instructor/admin only (enforced in API). */
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.error?.message ?? 'Failed to delete task');
  }
}

// ─── State metadata ───────────────────────────────────────────────────────────

export const STATE_META: Record<TaskState, {
  label: string;
  pillVariant: 'teal' | 'amber' | 'dim';
  tickStatus: 'done' | 'late' | 'open';
  description: string;
}> = {
  Assigned: {
    label: 'Assigned',
    pillVariant: 'dim',
    tickStatus: 'open',
    description: 'The manager has assigned this task to a team.',
  },
  Branched: {
    label: 'Branched',
    pillVariant: 'teal',
    tickStatus: 'open',
    description: 'A branch is open. Work is in progress.',
  },
  Pushed: {
    label: 'Pushed',
    pillVariant: 'teal',
    tickStatus: 'open',
    description: 'Commits have landed. Awaiting peer review.',
  },
  'In Review': {
    label: 'In Review',
    pillVariant: 'amber',
    tickStatus: 'late',
    description: 'Peer review is underway. Two approvals required.',
  },
  Closed: {
    label: 'Closed',
    pillVariant: 'teal',
    tickStatus: 'done',
    description: 'Merged, marked, and written to the learner\'s record.',
  },
};

/** Returns the transition that put the task in its current state. */
export function getLastTransition(task: Task): TaskTransition | undefined {
  return task.transitions[task.transitions.length - 1];
}
