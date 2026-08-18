'use client';

import * as React from 'react';
import { Button, Card } from 'ui';
import { InstructorBoard } from './components/InstructorBoard';
import { InstructorSplit } from './components/InstructorSplit';
import { InstructorQueue } from './components/InstructorQueue';

export default function InstructorDashboardPage() {
  const [drafts, setDrafts] = React.useState<Array<{ id: string; title: string; content: string; type: string; requiresApproval: boolean; createdAt: string }>>([]);

  React.useEffect(() => {
    const loadDrafts = async () => {
      const res = await fetch('/api/v1/ai/instructor-drafts?courseId=crs1');
      const payload = await res.json();
      setDrafts(payload.drafts ?? []);
    };
    void loadDrafts();
  }, []);

  const createDraft = async () => {
    const res = await fetch('/api/v1/ai/instructor-drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: 'crs1', type: 'announcement', context: 'Week 5 checkpoint and review window' }),
    });
    const payload = await res.json();
    setDrafts((current) => [payload.draft, ...current]);
  };

  const approveDraft = (id: string) => {
    setDrafts((current) => current.map((item) => (item.id === id ? { ...item, requiresApproval: false } : item)));
  };

  const discardDraft = (id: string) => {
    setDrafts((current) => current.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Instructor view</p>
          <h1 className="text-3xl font-semibold">Cohort operations</h1>
          <p className="max-w-2xl text-[var(--dim)]">Review what needs a person, keep the cohort moving, and oversee invites and roster changes.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: The Board */}
          <InstructorBoard />
          
          {/* Card 2: The Split */}
          <InstructorSplit />
          
          {/* Card 3: The Queue */}
          <InstructorQueue />
        </div>

        <Card className="bg-[var(--ink-2)] p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Instructor assistant</p>
              <h2 className="text-xl font-semibold">Drafts awaiting explicit approval</h2>
            </div>
            <Button onClick={createDraft}>Generate draft</Button>
          </div>

          <div className="space-y-3">
            {drafts.length === 0 && <p className="text-[var(--dim)]">No drafts are pending.</p>}
            {drafts.map((draft) => (
              <article key={draft.id} className="rounded border border-[var(--line)] bg-[var(--ink)] p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--signal)]">{draft.type}</p>
                    <h3 className="text-lg font-semibold">{draft.title}</h3>
                  </div>
                  <span className="rounded border border-[var(--line)] px-2 py-1 text-xs text-[var(--mark)]">{draft.requiresApproval ? 'Pending approval' : 'Approved'}</span>
                </div>
                <p className="text-sm text-[var(--dim)]">{draft.content}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => approveDraft(draft.id)}>Confirm</Button>
                  <Button onClick={() => discardDraft(draft.id)}>Discard</Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
