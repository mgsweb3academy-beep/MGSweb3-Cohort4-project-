'use client';
// apps/web/components/tasks/TaskColumn.tsx
// Part 5 — Task & Assignment Board
// A single kanban column for one TaskState. Shows count badge, task cards,
// empty state, and a "load more" button when the column is paginated.

import React, { useState } from 'react';
import type { Task, TaskState } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { STATE_META } from '@/lib/task-service';

const COLUMN_PAGE = 10; // Tasks shown before "Load more"

type Props = {
  state: TaskState;
  tasks: Task[];
  total: number;  // total matching this state (may be > tasks.length if paginated)
  onLoadMore?: () => void;
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
};

// Maps state → accent colour class for the count badge
const STATE_ACCENT: Record<TaskState, string> = {
  'Assigned':   'text-dim border-line',
  'Branched':   'text-signal border-signal/30',
  'Pushed':     'text-signal border-signal/30',
  'In Review':  'text-mark border-mark/30',
  'Closed':     'text-signal border-signal/30',
};

export function TaskColumn({ state, tasks, total, onLoadMore, onTaskClick, isLoading }: Props) {
  const [visibleCount, setVisibleCount] = useState(COLUMN_PAGE);
  const meta = STATE_META[state];
  const visible = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length || (onLoadMore && tasks.length < total);

  const handleLoadMore = () => {
    if (visibleCount < tasks.length) {
      setVisibleCount((v) => v + COLUMN_PAGE);
    } else {
      onLoadMore?.();
    }
  };

  return (
    <section
      aria-label={`${state} column — ${total} task${total !== 1 ? 's' : ''}`}
      className="flex flex-col min-w-0"
    >
      {/* Column header */}
      <div className="flex items-center gap-[.5rem] px-[.9rem] pb-[.6rem] border-b border-line mb-[.4rem]">
        <span className="font-mono text-[.68rem] tracking-[.12em] uppercase text-dim flex-1">
          {state}
        </span>
        <span
          className={[
            'font-mono text-[.62rem] tracking-[.06em] px-[.4rem] py-[.1rem]',
            'rounded border',
            STATE_ACCENT[state],
          ].join(' ')}
          aria-label={`${total} tasks`}
        >
          {total}
        </span>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-[2px] flex-1">
        {isLoading ? (
          // Skeleton loader
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[42px] mx-[.9rem] rounded-lg bg-ink-3 animate-pulse"
              aria-hidden="true"
            />
          ))
        ) : visible.length === 0 ? (
          // Empty state
          <div className="px-[.9rem] py-[1.5rem] text-center">
            <p className="text-dim text-[.82rem]">No tasks here.</p>
            {state === 'Assigned' && (
              <p className="text-[#5c6577] text-[.72rem] mt-[.3rem]">
                The manager assigns tasks to teams.
              </p>
            )}
          </div>
        ) : (
          visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>

      {/* Load more */}
      {hasMore && !isLoading && (
        <button
          id={`load-more-${state.toLowerCase().replace(/\s/g, '-')}`}
          type="button"
          onClick={handleLoadMore}
          className="mx-[.9rem] mt-[.5rem] py-[.4rem] text-[.72rem] font-mono tracking-[.08em] text-dim uppercase border border-line rounded-lg hover:bg-ink-3 hover:text-chalk transition-colors focus-visible:outline-[2px] focus-visible:outline-signal focus-visible:outline-offset-[3px]"
        >
          Load more ({tasks.length - visibleCount > 0 ? tasks.length - visibleCount : '…'} more)
        </button>
      )}
    </section>
  );
}
