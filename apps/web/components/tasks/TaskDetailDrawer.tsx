'use client';
// apps/web/components/tasks/TaskDetailDrawer.tsx
// Part 5 — Task & Assignment Board
// Slide-over drawer showing full task detail:
//   - FlowStrip with current step highlighted
//   - Full transition history timeline
//   - Edit form (instructor/admin)
//   - Manual state transition button (instructor/admin override only)

import React, { useEffect, useState } from 'react';
import type { Task, TaskState } from '@/lib/types';
import { TASK_STATES } from '@/lib/types';
import {
  STATE_META,
  formatTimeInState,
  isStalledInReview,
  getAvailableTransitions,
  validateTransition,
} from '@/lib/task-service';

// FlowStrip-style step indicators for the task state pipeline
const PIPELINE_STEPS: { state: TaskState; label: string; managed: boolean }[] = [
  { state: 'Assigned',   label: 'Assigned',   managed: true  },
  { state: 'Branched',   label: 'Branched',   managed: false },
  { state: 'Pushed',     label: 'Pushed',     managed: true  },
  { state: 'In Review',  label: 'In Review',  managed: false },
  { state: 'Closed',     label: 'Closed',     managed: true  },
];

const currentStepIndex = (state: TaskState) =>
  TASK_STATES.indexOf(state);

type Props = {
  task: Task;
  /** 'student' = read-only, 'instructor' | 'admin' = full control */
  userRole?: 'student' | 'instructor' | 'admin';
  onClose: () => void;
  onTaskUpdated: (updated: Task) => void;
};

export function TaskDetailDrawer({ task, userRole = 'instructor', onClose, onTaskUpdated }: Props) {
  const [activeTask, setActiveTask]   = useState<Task>(task);
  const [editing, setEditing]         = useState(false);
  const [editTitle, setEditTitle]     = useState(task.title);
  const [editDesc, setEditDesc]       = useState(task.description ?? '');
  const [editDue, setEditDue]         = useState(task.dueDate ?? '');
  const [transitioning, setTrans]     = useState(false);
  const [transError, setTransError]   = useState<string | null>(null);
  const [saveError, setSaveError]     = useState<string | null>(null);

  const isReadOnly = userRole === 'student';
  const stalled    = isStalledInReview(activeTask);

  // Sync when task prop changes externally
  useEffect(() => { setActiveTask(task); }, [task]);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Edit handlers ──
  const handleSave = async () => {
    setSaveError(null);
    try {
      const res = await fetch(`/api/v1/tasks/${activeTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-role': userRole },
        body: JSON.stringify({
          title:       editTitle.trim() || undefined,
          description: editDesc.trim()  || undefined,
          dueDate:     editDue           || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        setSaveError(body?.error?.message ?? 'Save failed.');
        return;
      }
      const updated: Task = await res.json();
      setActiveTask(updated);
      onTaskUpdated(updated);
      setEditing(false);
    } catch (err) {
      setSaveError((err as Error).message ?? 'Network error.');
    }
  };

  // ── State transition handler ──
  const handleTransition = async (to: TaskState) => {
    const err = validateTransition(activeTask.state, to);
    if (err) { setTransError(err); return; }

    setTrans(true);
    setTransError(null);
    try {
      const res = await fetch(`/api/v1/tasks/${activeTask.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, by: 'u8', byName: 'Dr. Yemi F.' }),
      });
      if (!res.ok) {
        const body = await res.json();
        setTransError(body?.error?.message ?? 'Transition failed.');
        return;
      }
      const updated: Task = await res.json();
      setActiveTask(updated);
      onTaskUpdated(updated);
    } catch (err) {
      setTransError((err as Error).message ?? 'Network error.');
    } finally {
      setTrans(false);
    }
  };

  const meta      = STATE_META[activeTask.state];
  const available = getAvailableTransitions(activeTask.state);
  const stepIdx   = currentStepIndex(activeTask.state);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-task-title"
        className={[
          'fixed top-0 right-0 bottom-0 z-50',
          'w-full max-w-[480px] flex flex-col',
          'bg-ink-2 border-l border-line',
          'overflow-y-auto',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-start gap-[.8rem] p-[1.3rem] border-b border-line sticky top-0 bg-ink-2 z-10">
          {/* State tick */}
          <i
            className={[
              'tick mt-[.25rem] flex-none',
              meta.tickStatus === 'done' ? 'tick-done' : meta.tickStatus === 'late' ? 'tick-warn' : '',
            ].join(' ')}
            aria-hidden="true"
          />

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                id="drawer-edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-ink-3 border border-signal rounded-[8px] px-[.6rem] py-[.3rem] text-[1rem] font-semibold font-display text-chalk focus:outline-none"
                aria-label="Task title"
              />
            ) : (
              <h2
                id="drawer-task-title"
                className="font-display text-[1rem] font-semibold tracking-tight text-chalk"
              >
                {activeTask.title}
              </h2>
            )}
            <div className="flex flex-wrap items-center gap-[.4rem] mt-[.3rem]">
              <span className={`pill pill-${meta.pillVariant}`}>{activeTask.state}</span>
              <span className="mono text-[.6rem] text-dim">{activeTask.teamName}</span>
              {stalled && (
                <span className="mono text-[.6rem] text-mark">
                  {formatTimeInState(activeTask.updatedAt)} in review
                </span>
              )}
              {activeTask.priority && (
                <span className="mono text-[.6rem] text-dim capitalize">{activeTask.priority}</span>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            id="drawer-close"
            type="button"
            onClick={onClose}
            aria-label="Close task drawer"
            className="btn btn-sm flex-none text-dim hover:text-chalk"
          >
            ✕
          </button>
        </div>

        {/* ── Pipeline strip ── */}
        <div className="flex items-stretch border-b border-line" role="list" aria-label="Task pipeline">
          {PIPELINE_STEPS.map((step, i) => {
            const isPast    = i < stepIdx;
            const isCurrent = i === stepIdx;
            return (
              <div
                key={step.state}
                role="listitem"
                className={[
                  'flex-1 py-[.6rem] px-[.3rem] text-center border-r last:border-r-0 border-line',
                  isCurrent ? 'bg-ink-3' : '',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className={[
                  'font-mono text-[.55rem] tracking-[.1em] uppercase mb-[.15rem]',
                  isPast ? 'text-signal' : isCurrent ? 'text-chalk' : 'text-[#5c6577]',
                ].join(' ')}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={[
                  'font-mono text-[.58rem] tracking-[.06em] truncate',
                  isPast ? 'text-signal' : isCurrent ? 'text-chalk' : 'text-[#5c6577]',
                ].join(' ')}>
                  {step.label}
                </div>
                {step.managed && (
                  <div className="font-mono text-[.5rem] text-signal/70 mt-[.1rem] truncate">
                    · MANAGED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 p-[1.3rem] flex flex-col gap-[1.2rem]">

          {/* Description */}
          <div>
            <p className="mono mb-[.4rem]">Description</p>
            {editing ? (
              <textarea
                id="drawer-edit-desc"
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-ink-3 border border-line rounded-[8px] px-[.7rem] py-[.5rem] text-sm text-chalk focus:outline-none focus:border-signal resize-none"
                aria-label="Task description"
              />
            ) : (
              <p className="text-dim text-[.9rem] leading-relaxed">
                {activeTask.description ?? 'No description provided.'}
              </p>
            )}
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-2 gap-[.6rem]">
            <div>
              <p className="mono mb-[.25rem]">Due date</p>
              {editing ? (
                <input
                  id="drawer-edit-due"
                  type="date"
                  value={editDue}
                  onChange={(e) => setEditDue(e.target.value)}
                  className="w-full bg-ink-3 border border-line rounded-[8px] px-[.6rem] py-[.4rem] text-sm text-chalk focus:outline-none focus:border-signal"
                  aria-label="Due date"
                />
              ) : (
                <p className="text-chalk text-sm">{activeTask.dueDate ?? '—'}</p>
              )}
            </div>
            <div>
              <p className="mono mb-[.25rem]">Lesson ref</p>
              <p className="text-chalk text-sm truncate">{activeTask.lessonTitle ?? '—'}</p>
            </div>
          </div>

          {/* Edit / Save row (instructor/admin only) */}
          {!isReadOnly && (
            <div className="flex gap-[.5rem]">
              {editing ? (
                <>
                  {saveError && (
                    <p role="alert" className="text-mark text-[.8rem] flex-1">{saveError}</p>
                  )}
                  <button id="drawer-cancel-edit" type="button" className="btn btn-sm" onClick={() => { setEditing(false); setSaveError(null); }}>
                    Cancel
                  </button>
                  <button id="drawer-save-edit" type="button" className="btn btn-solid btn-sm" onClick={handleSave}>
                    Save
                  </button>
                </>
              ) : (
                <button id="drawer-edit-btn" type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
                  Edit task
                </button>
              )}
            </div>
          )}

          {/* State transition controls (instructor/admin only) */}
          {!isReadOnly && available.length > 0 && (
            <div className="border-t border-line pt-[1rem]">
              <p className="mono mb-[.5rem]">Move to</p>
              <div className="flex flex-wrap gap-[.5rem]">
                {available.map((nextState) => {
                  const isReopen = activeTask.state === 'Closed' && nextState === 'Assigned';
                  return (
                    <button
                      id={`transition-${nextState.toLowerCase().replace(/\s/g, '-')}`}
                      key={nextState}
                      type="button"
                      disabled={transitioning}
                      onClick={() => handleTransition(nextState)}
                      className={[
                        'btn btn-sm',
                        isReopen ? 'btn-danger' : '',
                        transitioning ? 'opacity-60' : '',
                      ].join(' ')}
                    >
                      {isReopen ? '↩ Reopen' : `→ ${nextState}`}
                    </button>
                  );
                })}
              </div>
              {transError && (
                <p role="alert" className="text-mark text-[.8rem] mt-[.4rem]">{transError}</p>
              )}
            </div>
          )}

          {/* Transition history */}
          <div className="border-t border-line pt-[1rem]">
            <p className="mono mb-[.6rem]">History</p>
            <ol className="flex flex-col gap-[.5rem]" aria-label="Task transition history">
              {[...activeTask.transitions].reverse().map((t, i) => (
                <li key={i} className="flex items-start gap-[.6rem]">
                  {/* Timeline dot */}
                  <span
                    className={[
                      'w-[6px] h-[6px] rounded-full flex-none mt-[.35rem]',
                      t.by === 'manager' ? 'bg-signal' : t.by === 'system' ? 'bg-dim' : 'bg-chalk',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[.85rem] text-chalk leading-snug">
                      {t.from === null
                        ? `Created → ${t.to}`
                        : `${t.from} → ${t.to}`
                      }
                    </p>
                    <p className="font-mono text-[.62rem] text-dim mt-[.1rem]">
                      {t.byName} · {new Date(t.at).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>
    </>
  );
}
