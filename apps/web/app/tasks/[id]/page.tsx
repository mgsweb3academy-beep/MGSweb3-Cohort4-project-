'use client';
// apps/web/app/tasks/[id]/page.tsx
// Part 5 — Task & Assignment Board
// Standalone task detail page — addressable URL for each task.
// Equivalent content to the TaskDetailDrawer but as a full page with proper SEO.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Task, TaskState } from '@/lib/types';
import { TASK_STATES } from '@/lib/types';
import { MOCK_TASKS } from '@/lib/mock-data';
import {
  STATE_META,
  formatTimeInState,
  isStalledInReview,
  getAvailableTransitions,
  validateTransition,
} from '@/lib/task-service';
import { Nav } from 'ui';
import { ReviewSection } from './ReviewSection';

// FlowStrip steps (Part 1's FlowStrip would be imported in production)
const PIPELINE: { state: TaskState; managed: boolean }[] = [
  { state: 'Assigned',   managed: true  },
  { state: 'Branched',   managed: false },
  { state: 'Pushed',     managed: true  },
  { state: 'In Review',  managed: false },
  { state: 'Closed',     managed: true  },
];

// Mock session — Part 2 replaces with useSession()
type UserRole = 'student' | 'instructor' | 'admin';
const MOCK_SESSION: { user: { id: string; name: string }; role: UserRole } = {
  user: { id: 'u8', name: 'Dr. Yemi F.' },
  role: 'instructor',
};

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask]         = useState<Task | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [editTitle, setTitle]   = useState('');
  const [editDesc, setDesc]     = useState('');
  const [editDue, setDue]       = useState('');
  const [saveError, setSaveErr] = useState<string | null>(null);
  const [transError, setTErr]   = useState<string | null>(null);
  const [transitioning, setTr]  = useState(false);

  const { user, role } = MOCK_SESSION;
  const isReadOnly = role === 'student';

  // ── Fetch task ──
  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/tasks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data: Task) => {
        setTask(data);
        setTitle(data.title);
        setDesc(data.description ?? '');
        setDue(data.dueDate ?? '');
      })
      .catch(() => {
        // Fallback to mock
        const found = MOCK_TASKS.find((t) => t.id === id);
        if (found) {
          setTask(found);
          setTitle(found.title);
          setDesc(found.description ?? '');
          setDue(found.dueDate ?? '');
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleSave = async () => {
    if (!task) return;
    setSaveErr(null);
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-role': role },
        body: JSON.stringify({ title: editTitle || undefined, description: editDesc || undefined, dueDate: editDue || undefined }),
      });
      if (!res.ok) {
        const body = await res.json();
        setSaveErr(body?.error?.message ?? 'Save failed.');
        return;
      }
      const updated: Task = await res.json();
      setTask(updated);
      setEditing(false);
    } catch (err) {
      setSaveErr((err as Error).message ?? 'Network error.');
    }
  };

  const handleTransition = async (to: TaskState) => {
    if (!task) return;
    const err = validateTransition(task.state, to);
    if (err) { setTErr(err); return; }

    setTr(true); setTErr(null);
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, by: user.id, byName: user.name }),
      });
      if (!res.ok) {
        const body = await res.json();
        setTErr(body?.error?.message ?? 'Transition failed.');
        return;
      }
      setTask(await res.json());
    } catch (err) {
      setTErr((err as Error).message ?? 'Network error.');
    } finally {
      setTr(false);
    }
  };

  // ── Render states ──
  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-chalk font-body">
        <Nav currentPath="/tasks" />
        <main className="wrap pt-[clamp(5rem,12vh,8rem)]">
          <div className="flex flex-col gap-[.8rem] max-w-[640px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[24px] bg-ink-3 rounded-[6px] animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !task) {
    return (
      <div className="min-h-screen bg-ink text-chalk font-body">
        <Nav currentPath="/tasks" />
        <main className="wrap pt-[clamp(5rem,12vh,8rem)] text-center">
          <p className="mono text-dim mb-[.5rem]">Not found</p>
          <h1 className="font-display font-extrabold text-[clamp(1.8rem,4vw,2.6rem)] tracking-tight mb-[1rem]">
            Task not found
          </h1>
          <Link href="/tasks" className="btn btn-solid">← Back to board</Link>
        </main>
      </div>
    );
  }

  const meta      = STATE_META[task.state];
  const stepIdx   = TASK_STATES.indexOf(task.state);
  const stalled   = isStalledInReview(task);
  const available = getAvailableTransitions(task.state);

  return (
    <div className="min-h-screen bg-ink text-chalk font-body">
      <Nav currentPath="/tasks" />

      <main className="wrap pt-[clamp(4rem,10vh,6rem)] pb-[4rem]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-[.5rem] mono mb-[1.2rem]">
          <Link href="/tasks" className="text-dim hover:text-chalk transition-colors">
            Board
          </Link>
          <span className="text-[#5c6577]">/</span>
          <span className="text-chalk truncate max-w-[40ch]">{task.title}</span>
        </nav>

        <div className="grid gap-[2rem] lg:grid-cols-[1fr_320px]">
          {/* ── Left: main detail ── */}
          <div className="flex flex-col gap-[1.5rem]">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-[.5rem] mb-[.6rem]">
                <i
                  className={['tick', meta.tickStatus === 'done' ? 'tick-done' : meta.tickStatus === 'late' ? 'tick-warn' : ''].join(' ')}
                  aria-hidden="true"
                />
                <span className={`pill pill-${meta.pillVariant}`}>{task.state}</span>
                <span className="mono text-[.62rem] text-dim">{task.teamName}</span>
                {stalled && (
                  <span className="mono text-[.62rem] text-mark">
                    {formatTimeInState(task.updatedAt)} in review
                  </span>
                )}
              </div>

              {editing ? (
                <input
                  id="detail-edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-ink-3 border border-signal rounded-[10px] px-[.8rem] py-[.5rem] font-display text-[1.6rem] font-bold text-chalk focus:outline-none"
                  aria-label="Task title"
                />
              ) : (
                <h1 className="font-display font-extrabold text-[clamp(1.4rem,4vw,2rem)] tracking-[-0.025em] leading-[1.1]">
                  {task.title}
                </h1>
              )}

              <div className="font-mono text-[.7rem] tracking-[.06em] text-dim mt-[.4rem]">
                Created {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {task.dueDate && !editing && (
                  <> · Due {task.dueDate}</>
                )}
                {task.lessonTitle && (
                  <> · <span className="text-signal">{task.lessonTitle}</span></>
                )}
              </div>
            </div>

            {/* Pipeline (FlowStrip-style) */}
            <div
              className="flex border border-line rounded-[14px] overflow-hidden"
              role="list"
              aria-label="Task pipeline"
            >
              {PIPELINE.map((step, i) => {
                const isPast    = i < stepIdx;
                const isCurrent = i === stepIdx;
                return (
                  <div
                    key={step.state}
                    role="listitem"
                    aria-current={isCurrent ? 'step' : undefined}
                    className={[
                      'flex-1 py-[.8rem] px-[.4rem] text-center',
                      'border-r last:border-r-0 border-line',
                      isCurrent ? 'bg-ink-3' : '',
                    ].join(' ')}
                  >
                    <div className={[
                      'font-mono text-[.58rem] tracking-[.1em] uppercase mb-[.15rem]',
                      isPast ? 'text-signal' : isCurrent ? 'text-chalk' : 'text-[#5c6577]',
                    ].join(' ')}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className={[
                      'font-mono text-[.62rem] tracking-[.06em]',
                      isPast ? 'text-signal' : isCurrent ? 'text-chalk font-medium' : 'text-[#5c6577]',
                    ].join(' ')}>
                      {step.state}
                    </div>
                    {step.managed && (
                      <div className="font-mono text-[.5rem] text-signal/60 mt-[.1rem]">· MANAGED</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <div>
              <p className="mono mb-[.5rem]">Description</p>
              {editing ? (
                <textarea
                  id="detail-edit-desc"
                  rows={5}
                  value={editDesc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.6rem] text-sm text-chalk focus:outline-none focus:border-signal resize-none"
                  aria-label="Task description"
                />
              ) : (
                <p className="text-dim text-[.95rem] leading-[1.7]">
                  {task.description ?? 'No description.'}
                </p>
              )}
            </div>

            {/* Due date (editing) */}
            {editing && (
              <div>
                <label htmlFor="detail-edit-due" className="mono block mb-[.35rem]">Due date</label>
                <input
                  id="detail-edit-due"
                  type="date"
                  value={editDue}
                  onChange={(e) => setDue(e.target.value)}
                  className="bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.5rem] text-sm text-chalk focus:outline-none focus:border-signal"
                />
              </div>
            )}

            {/* Edit / Save actions */}
            {!isReadOnly && (
              <div className="flex gap-[.5rem]">
                {editing ? (
                  <>
                    {saveError && (
                      <p role="alert" className="text-mark text-sm mr-auto self-center">{saveError}</p>
                    )}
                    <button id="detail-cancel-edit" type="button" className="btn btn-sm" onClick={() => { setEditing(false); setSaveErr(null); }}>
                      Cancel
                    </button>
                    <button id="detail-save" type="button" className="btn btn-solid btn-sm" onClick={handleSave}>
                      Save changes
                    </button>
                  </>
                ) : (
                  <button id="detail-edit-btn" type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
                    Edit task
                  </button>
                )}
              </div>
            )}

            {/* Transition history */}
            <div>
              <p className="mono mb-[.7rem]">History</p>
              <ol className="flex flex-col gap-[.6rem]" aria-label="Transition history">
                {[...task.transitions].reverse().map((t, i) => (
                  <li key={i} className="flex items-start gap-[.7rem]">
                    <span
                      className={[
                        'w-[7px] h-[7px] rounded-full flex-none mt-[.35rem]',
                        t.by === 'manager' ? 'bg-signal' : t.by === 'system' ? 'bg-[#5c6577]' : 'bg-chalk',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[.9rem] text-chalk">
                        {t.from === null
                          ? `Task created → ${t.to}`
                          : `${t.from} → ${t.to}`}
                      </p>
                      <p className="font-mono text-[.65rem] text-dim mt-[.1rem]">
                        {t.byName} · {new Date(t.at).toLocaleString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Part 7: Peer Review Section */}
            {(task.state === 'Pushed' || task.state === 'In Review' || task.state === 'Closed') && (
              <ReviewSection task={task} currentUser={user} />
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="flex flex-col gap-[1.2rem]">
            {/* Metadata card */}
            <div className="card">
              <p className="mono mb-[.8rem]">Details</p>
              <dl className="flex flex-col gap-[.6rem] text-[.88rem]">
                <div className="flex justify-between">
                  <dt className="text-dim">Team</dt>
                  <dd className="text-chalk font-medium">{task.teamName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-dim">Priority</dt>
                  <dd className={[
                    'capitalize font-medium',
                    task.priority === 'high' ? 'text-mark' : task.priority === 'medium' ? 'text-signal' : 'text-dim',
                  ].join(' ')}>
                    {task.priority ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-dim">Due</dt>
                  <dd className="text-chalk">{task.dueDate ?? '—'}</dd>
                </div>
                {task.lessonTitle && (
                  <div className="flex justify-between">
                    <dt className="text-dim">Lesson</dt>
                    <dd className="text-signal text-right max-w-[180px] truncate">{task.lessonTitle}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-dim">Updated</dt>
                  <dd className="text-chalk">{new Date(task.updatedAt).toLocaleDateString('en-GB')}</dd>
                </div>
              </dl>
            </div>

            {/* State transition card (instructor/admin only) */}
            {!isReadOnly && available.length > 0 && (
              <div className="card">
                <p className="mono mb-[.7rem]">Move task</p>
                <div className="flex flex-col gap-[.4rem]">
                  {available.map((nextState) => {
                    const isReopening = task.state === 'Closed' && nextState === 'Assigned';
                    return (
                      <button
                        id={`detail-transition-${nextState.toLowerCase().replace(/\s/g, '-')}`}
                        key={nextState}
                        type="button"
                        disabled={transitioning}
                        onClick={() => handleTransition(nextState)}
                        className={[
                          'btn w-full justify-center',
                          isReopening ? 'btn-danger' : 'btn-solid',
                          transitioning ? 'opacity-60' : '',
                        ].join(' ')}
                      >
                        {isReopening ? '↩ Reopen task' : `→ Move to ${nextState}`}
                      </button>
                    );
                  })}
                </div>
                {transError && (
                  <p role="alert" className="text-mark text-[.8rem] mt-[.5rem]">{transError}</p>
                )}
              </div>
            )}

            {/* Manager placeholder */}
            <div className="card">
              <div className="flex items-center gap-[.5rem] mb-[.5rem]">
                <span className="pulse" aria-hidden="true" />
                <span className="font-mono text-[.65rem] tracking-[.12em] uppercase text-signal">
                  Manager
                </span>
              </div>
              <p className="text-dim text-[.82rem] leading-relaxed">
                Manager actions on this task will appear here. Part 8 will populate this feed.
              </p>
            </div>

            {/* Back link */}
            <Link
              href="/tasks"
              id="detail-back-link"
              className="btn w-full justify-center"
            >
              ← Back to board
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
