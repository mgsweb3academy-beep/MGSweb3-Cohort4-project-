'use client';
// apps/web/components/tasks/CreateTaskModal.tsx
// Part 5 — Task & Assignment Board
// Modal dialog for creating a new task.
// Uses globals.css classes throughout — no raw hex values.

import React, { useEffect, useRef, useState } from 'react';
import type { Task, TaskPriority } from '@/lib/types';
import { MOCK_TEAMS } from '@/lib/mock-data';

type Props = {
  cohortId: string;
  onCreated: (task: Task) => void;
  onClose: () => void;
};

export function CreateTaskModal({ cohortId, onCreated, onClose }: Props) {
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [teamId, setTeamId]       = useState('');
  const [priority, setPriority]   = useState<TaskPriority>('medium');
  const [dueDate, setDueDate]     = useState('');
  const [lessonTitle, setLesson]  = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSub]      = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  // Trap focus and auto-focus title on mount
  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const teamsInCohort = MOCK_TEAMS.filter((t) => t.cohortId === cohortId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim())  return setError('Task title is required.');
    if (!teamId)        return setError('Please assign this task to a team.');

    const team = teamsInCohort.find((t) => t.id === teamId);
    setSub(true);
    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'instructor' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          teamId,
          teamName: team?.name ?? teamId,
          cohortId,
          priority,
          dueDate: dueDate || undefined,
          lessonTitle: lessonTitle.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body?.error?.message ?? 'Failed to create task.');
        return;
      }

      const created: Task = await res.json();
      onCreated(created);
      onClose();
    } catch (err) {
      setError((err as Error).message ?? 'Network error.');
    } finally {
      setSub(false);
    }
  };

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative card max-w-lg w-full rounded-[18px] shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[1.2rem]">
          <h2 id="create-task-title" className="font-display text-[1.1rem] font-semibold tracking-tight">
            New task
          </h2>
          <button
            id="create-task-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-sm text-dim hover:text-chalk"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[.9rem]">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="mono block mb-[.35rem]">Title *</label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              required
              placeholder="e.g. Auth service, Rate limiter…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk placeholder:text-[#5c6577] focus:outline-none focus:border-signal transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="mono block mb-[.35rem]">Description</label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="What needs to be built and why."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk placeholder:text-[#5c6577] focus:outline-none focus:border-signal transition-colors resize-none"
            />
          </div>

          {/* Team + Priority row */}
          <div className="grid grid-cols-2 gap-[.7rem]">
            <div>
              <label htmlFor="task-team" className="mono block mb-[.35rem]">Team *</label>
              <select
                id="task-team"
                required
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk focus:outline-none focus:border-signal transition-colors"
              >
                <option value="">Select team…</option>
                {teamsInCohort.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="mono block mb-[.35rem]">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk focus:outline-none focus:border-signal transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due date + Lesson row */}
          <div className="grid grid-cols-2 gap-[.7rem]">
            <div>
              <label htmlFor="task-due-date" className="mono block mb-[.35rem]">Due date</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk focus:outline-none focus:border-signal transition-colors"
              />
            </div>

            <div>
              <label htmlFor="task-lesson" className="mono block mb-[.35rem]">Related lesson</label>
              <input
                id="task-lesson"
                type="text"
                placeholder="Optional"
                value={lessonTitle}
                onChange={(e) => setLesson(e.target.value)}
                className="w-full bg-ink-3 border border-line rounded-[10px] px-[.8rem] py-[.55rem] text-sm text-chalk placeholder:text-[#5c6577] focus:outline-none focus:border-signal transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-mark text-sm py-[.5rem] px-[.8rem] bg-mark/10 border border-mark/30 rounded-[8px]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-[.6rem] justify-end pt-[.4rem] border-t border-line mt-[.2rem]">
            <button
              id="create-task-cancel"
              type="button"
              onClick={onClose}
              className="btn btn-sm"
            >
              Cancel
            </button>
            <button
              id="create-task-submit"
              type="submit"
              disabled={submitting}
              className="btn btn-solid btn-sm disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
