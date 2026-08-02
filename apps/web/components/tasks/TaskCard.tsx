'use client';
// apps/web/components/tasks/TaskCard.tsx
// Part 5 — Task & Assignment Board
// A single task row inside a board column. Uses only packages/ui primitives
// and globals.css classes — no raw hex values, no local color decisions.

import React from 'react';
import Link from 'next/link';
import type { Task } from '@/lib/types';
import { formatTimeInState, isStalledInReview, STATE_META } from '@/lib/task-service';

type Props = {
  task: Task;
  /** Called when the card is clicked. If provided, wraps in a button instead of a link. */
  onClick?: (task: Task) => void;
};

const PRIORITY_DOTS: Record<string, string> = {
  high:   'bg-mark',
  medium: 'bg-signal',
  low:    'bg-dim',
};

export function TaskCard({ task, onClick }: Props) {
  const meta    = STATE_META[task.state];
  const timeStr = formatTimeInState(task.updatedAt);
  const stalled = isStalledInReview(task);

  // Tick icon — matches landing page's board card exactly
  const tick = (
    <i
      className={[
        'tick flex-none',
        meta.tickStatus === 'done' ? 'tick-done' : meta.tickStatus === 'late' ? 'tick-warn' : '',
      ].join(' ')}
      aria-hidden="true"
    />
  );

  // Time-in-state label — amber if stalled in review
  const timeLabel = (
    <span
      className={[
        'font-mono text-[.7rem] whitespace-nowrap ml-auto',
        stalled ? 'text-mark' : 'text-dim',
      ].join(' ')}
    >
      {task.teamName} · {stalled ? `${timeStr}` : task.state === 'Closed' ? 'closed' : task.state.toLowerCase()}
      {stalled ? '' : ''}
    </span>
  );

  const inner = (
    <div
      className={[
        'flex items-center gap-[.6rem] px-[.9rem] py-[.65rem]',
        'border border-transparent rounded-lg',
        'hover:bg-ink-3 hover:border-line transition-colors',
        'group',
      ].join(' ')}
    >
      {tick}

      {/* Priority dot */}
      {task.priority && (
        <span
          className={`w-[5px] h-[5px] rounded-full flex-none ${PRIORITY_DOTS[task.priority] ?? 'bg-dim'}`}
          aria-label={`Priority: ${task.priority}`}
        />
      )}

      {/* Task title */}
      <span className="text-[#b9c0cc] text-sm truncate min-w-0 flex-1 group-hover:text-chalk transition-colors">
        {task.title}
      </span>

      {/* Time / team / state label */}
      {timeLabel}
    </div>
  );

  if (onClick) {
    return (
      <button
        id={`task-card-${task.id}`}
        type="button"
        onClick={() => onClick(task)}
        className="w-full text-left focus-visible:outline-[2px] focus-visible:outline-signal focus-visible:outline-offset-[3px] rounded-lg"
        aria-label={`Task: ${task.title}, ${task.state}, ${task.teamName}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      id={`task-card-link-${task.id}`}
      href={`/tasks/${task.id}`}
      className="block focus-visible:outline-[2px] focus-visible:outline-signal focus-visible:outline-offset-[3px] rounded-lg"
      aria-label={`Task: ${task.title}, ${task.state}, ${task.teamName}`}
    >
      {inner}
    </Link>
  );
}
