'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CohortPanel,
  ContributionMatrix,
  FlowStrip,
  Nav,
  NotificationBell,
  StatusPill,
  Tick,
} from 'ui';
import { MOCK_COHORTS, MOCK_COURSES, MOCK_TASKS, MOCK_USERS } from '@/lib/mock-data';

type DashboardView = 'day-one' | 'week-eight';

type DashboardTask = {
  title: string;
  state: string;
  blocker: string;
  dueDate?: string;
  teamName?: string;
};

const studentName = 'Adaeze O.';
const studentId = 'u1';

const flowSteps = [
  { title: 'Assigned', description: 'The work is waiting for the team to begin.' },
  { title: 'Branched', description: 'A task branch is open and the team is coding.' },
  { title: 'Pushed', description: 'Work has reached the repo and is ready for review.' },
  { title: 'In Review', description: 'Two teammates review the submission before closure.' },
  { title: 'Closed', description: 'The task is complete and recorded for the learner.' },
];

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const [view, setView] = React.useState<DashboardView>('day-one');
  const [tutorQuestion, setTutorQuestion] = React.useState('How should I explain the difference between a branch and a pull request?');
  const [tutorAnswer, setTutorAnswer] = React.useState<string | null>(null);
  const [certificateStatus, setCertificateStatus] = React.useState('Ready when the cohort is complete.');

  const cohort = MOCK_COHORTS.find((item) => item.id === 'c07') ?? MOCK_COHORTS[0];
  const user = MOCK_USERS.find((item) => item.id === studentId);
  const courses = MOCK_COURSES.slice(0, 3);

  const selectedData = React.useMemo(() => {
    if (view === 'week-eight') {
      const task = MOCK_TASKS.find((item) => item.teamId === 't4' && item.state === 'In Review') ?? MOCK_TASKS[0];
      return {
        task: {
          title: task.title,
          state: task.state,
          blocker: 'Waiting for two peer approvals before it can close.',
          dueDate: task.dueDate,
          teamName: task.teamName,
        } as DashboardTask,
        contribution: {
          yourShare: 12,
          teamAverage: 27,
          teamName: 'Team 4',
          story: 'You are below the team average this week, and the dashboard shows that clearly.',
        },
        matrix: [
          [studentName, [0, 1, 2, 3, 4, 4, 2, 1]],
          ['Marcus B.', [1, 2, 3, 3, 4, 3, 2, 2]],
          ['Priya N.', [0, 1, 1, 2, 2, 2, 1, 1]],
          ['Tobi A.', [3, 4, 4, 5, 5, 4, 3, 4]],
        ] as Array<[string, number[]]>,
        certificate: {
          available: true,
          date: '2025-03-28',
          message: 'Certificate is ready and will download as a file.',
        },
      };
    }

    return {
      task: null as DashboardTask | null,
      contribution: {
        yourShare: 0,
        teamAverage: 0,
        teamName: 'Team 4',
        story: 'No tasks or contribution history yet. The dashboard stays honest about the empty state.',
      },
      matrix: [
        [studentName, [0, 0, 0, 0, 0, 0, 0, 0]],
        ['Marcus B.', [0, 0, 0, 0, 0, 0, 0, 0]],
        ['Priya N.', [0, 0, 0, 0, 0, 0, 0, 0]],
        ['Tobi A.', [0, 0, 0, 0, 0, 0, 0, 0]],
      ] as Array<[string, number[]]>,
      certificate: {
        available: false,
        date: '—',
        message: 'Your certificate will appear here when the course and cohort are complete.',
      },
    };
  }, [view]);

  const handleDownloadCertificate = () => {
    if (!selectedData.certificate.available) {
      setCertificateStatus('No certificate is available yet because the cohort is not complete.');
      return;
    }

    const certificateText = [
      'Corridor Certificate of Completion',
      '',
      `Learner: ${studentName}`,
      `Cohort: ${cohort.name}`,
      `Completion date: ${formatDate(selectedData.certificate.date)}`,
      `Status: Completed`,
      '',
      'This certificate was generated automatically by the platform.',
    ].join('\n');

    const blob = new Blob([certificateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corridor-certificate-${studentName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setCertificateStatus(`Downloaded certificate for ${formatDate(selectedData.certificate.date)}.`);
  };

  const handleTutorAnswer = () => {
    setTutorAnswer(`Your tutor answer is grounded in the cohort content: ${tutorQuestion}`);
  };

  const currentTask = selectedData.task;

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] p-8 md:p-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--signal)]">Student dashboard</p>
                <h1 className="text-3xl font-semibold">Welcome back, {user?.name ?? studentName}</h1>
                <p className="mt-1 max-w-2xl text-[var(--dim)]">Your cohort work, task state, and contribution standing stay in one place.</p>
              </div>
              <div className="flex gap-2">
                <Button variant={view === 'day-one' ? 'solid' : 'outline'} size="sm" onClick={() => setView('day-one')}>
                  Day one
                </Button>
                <Button variant={view === 'week-eight' ? 'solid' : 'outline'} size="sm" onClick={() => setView('week-eight')}>
                  Week eight
                </Button>
              </div>
            </div>
          </header>

          <CohortPanel
            cohortName={cohort.name}
            learnersCount={cohort.learnerCount}
            teamsCount={cohort.teamCount}
            currentWeek={view === 'week-eight' ? 8 : 1}
            totalWeeks={cohort.weekCount}
            managerLog={
              <>
                <span className="pulse mt-[.45rem]" aria-hidden="true"></span>
                <div className="min-w-[8rem]">
                  <div className="font-mono text-[.68rem] tracking-[.12em] uppercase text-signal">Manager</div>
                </div>
                <p className="m-0 flex-1 text-[.88rem] text-dim">
                  {view === 'week-eight'
                    ? 'Flagged Team 4 — one member wrote 82% of the contribution. The dashboard shows that honestly.'
                    : 'Day one view: no tasks or contribution history yet. The dashboard stays explicit about the empty state.'}
                </p>
                <span className="font-mono text-[.68rem] text-[#5c6577]">{view === 'week-eight' ? '06:12' : 'Now'}</span>
              </>
            }
          >
            <ContributionMatrix learners={selectedData.matrix} weeks={8} currentWeek={view === 'week-eight' ? 8 : 1} />
          </CohortPanel>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="bg-[var(--ink-2)] p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Current task</p>
                  <h2 className="mt-1 text-xl font-semibold">{currentTask ? currentTask.title : 'No task yet'}</h2>
                </div>
                <StatusPill variant={currentTask ? 'teal' : 'dim'}>{currentTask ? currentTask.state : 'Waiting to start'}</StatusPill>
              </div>

              <div className="mt-4 rounded border border-[var(--line)] bg-[var(--ink)] p-4">
                {currentTask ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--dim)]">
                      <span>{currentTask.teamName ?? 'Your team'}</span>
                      <span>·</span>
                      <span>Due {formatDate(currentTask.dueDate)}</span>
                    </div>
                    <p className="mt-3 text-[var(--chalk)]">{currentTask.blocker}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusPill variant="amber">Needs review</StatusPill>
                      <StatusPill variant="dim">Team context</StatusPill>
                    </div>
                  </>
                ) : (
                  <p className="text-[var(--dim)]">Your cohort has just started. Your first task will appear here once the team is assigned.</p>
                )}
              </div>

              <div className="mt-4">
                <FlowStrip steps={flowSteps} />
              </div>
            </Card>

            <Card className="bg-[var(--ink-2)] p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Contribution standing</p>
                  <h2 className="mt-1 text-xl font-semibold">Your team split</h2>
                </div>
                <NotificationBell notifications={[]} onMarkAsRead={() => {}} />
              </div>

              <div className="mt-4 rounded border border-[var(--line)] bg-[var(--ink)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--dim)]">Your share</p>
                    <p className="text-2xl font-semibold text-[var(--chalk)]">{selectedData.contribution.yourShare}%</p>
                  </div>
                  <StatusPill variant={selectedData.contribution.yourShare >= selectedData.contribution.teamAverage ? 'teal' : 'amber'}>
                    {selectedData.contribution.yourShare >= selectedData.contribution.teamAverage ? 'Above team average' : 'Below team average'}
                  </StatusPill>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-[var(--dim)]">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2">
                    <span>{selectedData.contribution.teamName}</span>
                    <span className="text-[var(--chalk)]">{selectedData.contribution.teamAverage}% team average</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Honest comparison</span>
                    <span className="text-[var(--chalk)]">{selectedData.contribution.story}</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="bg-[var(--ink-2)] p-8 h-full">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Enrolled courses</p>
                  <h2 className="mt-1 text-xl font-semibold">Progress and next steps</h2>
                </div>
                <StatusPill variant="dim">{courses.length} active</StatusPill>
              </div>
              <div className="mt-4 space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="rounded border border-[var(--line)] bg-[var(--ink)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[var(--chalk)]">{course.title}</h3>
                        <p className="mt-1 text-sm text-[var(--dim)]">{course.programName}</p>
                      </div>
                      <StatusPill variant={course.status === 'published' ? 'teal' : 'amber'}>{course.status}</StatusPill>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Tick status="done" />
                      <span className="text-sm text-[var(--dim)]">{course.lessonCount} lessons · {course.enrollmentCount} learners enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="bg-[var(--ink-2)] p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Upcoming deadlines</p>
                    <h2 className="mt-1 text-xl font-semibold">What needs attention soon</h2>
                  </div>
                  <StatusPill variant="amber">2 due soon</StatusPill>
                </div>
                <div className="mt-4 space-y-3">
                  {MOCK_TASKS.slice(0, 2).map((task) => (
                    <div key={task.id} className="flex items-start justify-between gap-3 rounded border border-[var(--line)] bg-[var(--ink)] p-3">
                      <div>
                        <p className="text-[var(--chalk)]">{task.title}</p>
                        <p className="mt-1 text-sm text-[var(--dim)]">{task.teamName} · {task.state}</p>
                      </div>
                      <span className="font-mono text-[0.72rem] text-[var(--signal)]">{formatDate(task.dueDate)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-[var(--ink-2)] p-8 h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Certificates</p>
                    <h2 className="mt-1 text-xl font-semibold">Downloadable completion proof</h2>
                  </div>
                  <StatusPill variant={selectedData.certificate.available ? 'teal' : 'dim'}>{selectedData.certificate.available ? 'Ready' : 'Pending'}</StatusPill>
                </div>
                <p className="mt-3 text-sm text-[var(--dim)]">{selectedData.certificate.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button onClick={handleDownloadCertificate} variant="solid" size="sm">Download certificate</Button>
                  <span className="text-sm text-[var(--dim)]">{certificateStatus}</span>
                </div>
              </Card>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="bg-[var(--ink-2)] p-8">
              <div className="mb-4">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">AI tutor</p>
                <h2 className="mt-1 text-xl font-semibold">Open the tutor from the dashboard</h2>
              </div>
              <textarea
                value={tutorQuestion}
                onChange={(event) => setTutorQuestion(event.target.value)}
                className="w-full rounded border border-[var(--line)] bg-[var(--ink)] p-3 text-[var(--chalk)]"
                rows={4}
              />
              <div className="mt-3 flex gap-2">
                <Button onClick={handleTutorAnswer}>Ask tutor</Button>
              </div>
              {tutorAnswer && <p className="mt-4 rounded border border-[var(--line)] bg-[var(--ink)] p-3 text-sm text-[var(--dim)]">{tutorAnswer}</p>}
            </Card>

            <Card className="bg-[var(--ink-2)] p-8">
              <div className="mb-4">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--signal)]">Notifications</p>
                <h2 className="mt-1 text-xl font-semibold">What changed for you</h2>
              </div>
              <div className="space-y-3">
                <div className="rounded border border-[var(--line)] bg-[var(--ink)] p-3">
                  <p className="text-[var(--chalk)]">Review request received</p>
                  <p className="mt-1 text-sm text-[var(--dim)]">Your team received feedback from the manager about the current task.</p>
                </div>
                <div className="rounded border border-[var(--line)] bg-[var(--ink)] p-3">
                  <p className="text-[var(--chalk)]">Deadline approaching</p>
                  <p className="mt-1 text-sm text-[var(--dim)]">The current task is due {formatDate(MOCK_TASKS[0].dueDate)}.</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
