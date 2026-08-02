import { Card } from 'ui';

export default function InstructorDashboardPage() {
  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Instructor view</p>
          <h1 className="text-3xl font-semibold">Cohort operations</h1>
          <p className="max-w-2xl text-[var(--dim)]">Review what needs a person, keep the cohort moving, and oversee invites and roster changes.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Current cohort</h2>
            <p className="mt-2 text-[var(--dim)]">Backend Engineering · Cohort 07 · Week 5 of 8</p>
          </Card>
          <Card className="bg-[var(--ink-2)] p-6">
            <h2 className="text-xl font-semibold">Needs attention</h2>
            <p className="mt-2 text-[var(--dim)]">Team 4 still requires a human review after the manager flagged contribution imbalance.</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
