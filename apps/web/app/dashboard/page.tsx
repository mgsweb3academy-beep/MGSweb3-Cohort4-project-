import { Card } from 'ui';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Student dashboard</p>
          <h1 className="text-3xl font-semibold">Welcome back to Corridor</h1>
          <p className="max-w-2xl text-[var(--dim)]">Your cohort work, task status, and manager updates stay in one place.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Active tasks</h2>
            <p className="mt-2 text-[var(--dim)]">Your team is currently in review for Auth service.</p>
          </Card>
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Manager updates</h2>
            <p className="mt-2 text-[var(--dim)]">Reopened 3 tasks that were merged without a review.</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
