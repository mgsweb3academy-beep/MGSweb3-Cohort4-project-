'use client';
// apps/web/app/tasks/page.tsx
// Part 5 — Task & Assignment Board
// The main kanban board — "every task, and who has it"
// Matches PRODUCT-DIRECTION.md §5.5 "the board" card description exactly.
// Role gating: students = read-only for their cohort; instructors = full CRUD.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Task, TaskState } from '@/lib/types';
import { TASK_STATES } from '@/lib/types';
import { MOCK_TASKS, MOCK_COHORTS, MOCK_TEAMS } from '@/lib/mock-data';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { Nav } from 'ui';

// ─── Mock session (Part 2 will replace with useSession()) ─────────────────────
type UserRole = 'student' | 'instructor' | 'admin';
const MOCK_SESSION: { user: { id: string; name: string }; role: UserRole } = {
  user: { id: 'u8', name: 'Dr. Yemi F.' },
  role: 'instructor',
};

const PAGE_LIMIT = 20;

export default function TaskBoardPage() {
  const [tasks, setTasks]             = useState<Task[]>([...MOCK_TASKS]);
  const [selectedTask, setSelected]   = useState<Task | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [selectedCohort, setCohort]   = useState(MOCK_COHORTS[0]?.id ?? 'c07');
  const [selectedTeam, setTeam]       = useState<string>('all');
  const [loading, setLoading]         = useState(false);
  const [pageMap, setPageMap]         = useState<Record<string, number>>(
    Object.fromEntries(TASK_STATES.map((s) => [s, PAGE_LIMIT])),
  );

  const { user, role } = MOCK_SESSION;
  const isReadOnly = role === 'student';

  // ── Fetch tasks on filter change ──
  const fetchTasks = useCallback(async (cohortId: string, teamId?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ cohortId });
      if (teamId && teamId !== 'all') params.set('teamId', teamId);
      params.set('limit', '200'); // fetch all for client-side split by state
      const res = await fetch(`/api/v1/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } catch {
      // Fallback to mock
      setTasks([...MOCK_TASKS]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(selectedCohort, selectedTeam);
  }, [selectedCohort, selectedTeam, fetchTasks]);

  // ── Group tasks by state for board columns ──
  const tasksByState = useMemo(() => {
    return TASK_STATES.reduce<Record<TaskState, Task[]>>(
      (acc, state) => {
        acc[state] = tasks.filter((t) => t.state === state);
        return acc;
      },
      {} as Record<TaskState, Task[]>,
    );
  }, [tasks]);

  // ── Event handlers ──
  const handleTaskCreated = (created: Task) => {
    setTasks((prev) => [created, ...prev]);
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelected(updated);
  };

  const cohort = MOCK_COHORTS.find((c) => c.id === selectedCohort);
  const teamsInCohort = MOCK_TEAMS.filter((t) => t.cohortId === selectedCohort);

  // Current-week calculation matches cohort-utils pattern
  const weekLabel = cohort
    ? (() => {
        const start = new Date(cohort.startDate);
        const now   = new Date();
        const ms    = now.getTime() - start.getTime();
        const week  = Math.min(Math.max(Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)), 1), cohort.weekCount);
        return `Week ${week} of ${cohort.weekCount}`;
      })()
    : '';

  const totalOpen = tasks.filter((t) => t.state !== 'Closed').length;

  return (
    <div className="min-h-screen bg-ink text-chalk font-body">
      <Nav currentPath="/tasks" />

      <main className="pt-[clamp(4rem,10vh,6rem)]">
        {/* ── Page header ── */}
        <div className="wrap pb-[1.5rem] border-b border-line">
          {/* Eyebrow */}
          <div className="flex flex-wrap items-center gap-[.5rem] mb-[.6rem]">
            <p className="mono text-signal">The board</p>
            {weekLabel && (
              <span className="font-mono text-[.68rem] tracking-[.06em] text-mark ml-auto">
                {weekLabel}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-[1rem]">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-extrabold text-[clamp(1.6rem,4vw,2.4rem)] tracking-[-0.03em] leading-[1.05]">
                Every task, and who has it
              </h1>
              {cohort && (
                <p className="font-mono text-[.72rem] tracking-[.08em] text-dim mt-[.35rem]">
                  {cohort.name} · {cohort.learnerCount} learners · {cohort.teamCount} teams
                </p>
              )}
            </div>

            {/* New task CTA — instructor/admin only */}
            {!isReadOnly && (
              <button
                id="new-task-btn"
                type="button"
                onClick={() => setShowCreate(true)}
                className="btn btn-solid"
              >
                + New task
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-[.6rem] mt-[1rem]">
            {/* Cohort selector */}
            <select
              id="board-cohort-filter"
              value={selectedCohort}
              onChange={(e) => setCohort(e.target.value)}
              aria-label="Select cohort"
              className="bg-ink-3 border border-line rounded-[10px] px-[.7rem] py-[.4rem] text-[.82rem] text-chalk font-mono tracking-[.04em] focus:outline-none focus:border-signal transition-colors"
            >
              {MOCK_COHORTS.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Team filter */}
            <select
              id="board-team-filter"
              value={selectedTeam}
              onChange={(e) => setTeam(e.target.value)}
              aria-label="Filter by team"
              className="bg-ink-3 border border-line rounded-[10px] px-[.7rem] py-[.4rem] text-[.82rem] text-chalk font-mono tracking-[.04em] focus:outline-none focus:border-signal transition-colors"
            >
              <option value="all">All teams</option>
              {teamsInCohort.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Summary */}
            {!loading && (
              <span className="ml-auto font-mono text-[.68rem] text-dim self-center">
                {totalOpen} open · {tasks.filter((t) => t.state === 'Closed').length} closed
              </span>
            )}
          </div>
        </div>

        {/* ── Kanban board ── */}
        {/* Five columns — one per TaskState.
            Responsive: scrollable row on mobile, grid on ≥900px. */}
        <div
          className="wrap pt-[1.5rem] pb-[3rem]"
          role="region"
          aria-label="Task board — tasks grouped by state"
        >
          {/* Mobile: horizontal scroll; desktop: 5-column grid */}
          <div
            className="grid gap-0 border border-line rounded-[14px] overflow-hidden"
            style={{
              gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))',
              overflowX: 'auto',
            }}
          >
            {TASK_STATES.map((state, idx) => {
              const stateTasks = tasksByState[state] ?? [];
              const isLast = idx === TASK_STATES.length - 1;
              return (
                <div
                  key={state}
                  className={[
                    'min-w-[160px] py-[.9rem]',
                    !isLast ? 'border-r border-line' : '',
                  ].join(' ')}
                >
                  <TaskColumn
                    state={state}
                    tasks={stateTasks}
                    total={stateTasks.length}
                    isLoading={loading}
                    onTaskClick={setSelected}
                  />
                </div>
              );
            })}
          </div>

          {/* Manager log line — matches landing page panel's manager line */}
          <div className="mt-[1.5rem] flex flex-wrap items-start gap-[.6rem] px-[.1rem]">
            <span className="pulse mt-[.45rem]" aria-hidden="true" />
            <div>
              <div className="font-mono text-[.68rem] tracking-[.12em] uppercase text-signal">
                Manager
              </div>
            </div>
            <p className="text-[.88rem] text-dim flex-[1_1_240px] mt-[.1rem]">
              Reopened <b className="text-chalk font-medium">3 tasks</b> that were merged without a review.
              Moved <b className="text-chalk font-medium">Auth service</b> into review.
              Flagged <b className="text-chalk font-medium">Team 4</b> — one member wrote 82% of the commits.
            </p>
            <span className="font-mono text-[.68rem] text-[#5c6577] self-start mt-[.2rem]">06:12</span>
          </div>
        </div>
      </main>

      {/* ── Modals / Drawers ── */}
      {showCreate && (
        <CreateTaskModal
          cohortId={selectedCohort}
          onCreated={handleTaskCreated}
          onClose={() => setShowCreate(false)}
        />
      )}

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          userRole={role}
          onClose={() => setSelected(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
