'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Nav, Button, Card, StatusPill } from '@packages/ui';
import { MOCK_COHORTS, MOCK_PROGRAMS, MOCK_USERS } from '../../lib/mock-data';
import { calculateCohortWeek } from '../../lib/cohort-utils';
import type { Cohort } from '../../lib/types';

export default function CohortsListingPage() {
  const searchParams = useSearchParams();
  const initialProgramId = searchParams.get('programId');
  const openScheduleModalParam = searchParams.get('schedule') === 'true';

  const [cohorts, setCohorts] = useState<Cohort[]>(MOCK_COHORTS);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Form state
  const [programId, setProgramId] = useState(initialProgramId || MOCK_PROGRAMS[0]?.id || '');
  const [cohortName, setCohortName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekCount, setWeekCount] = useState<number>(8);
  const [instructorId, setInstructorId] = useState('u8');

  useEffect(() => {
    if (openScheduleModalParam || initialProgramId) {
      if (initialProgramId) {
        setProgramId(initialProgramId);
        const prog = MOCK_PROGRAMS.find((p) => p.id === initialProgramId);
        if (prog) {
          setWeekCount(prog.weekCount);
          setCohortName(`${prog.name} — Cohort 0${cohorts.length + 5}`);
        }
      }
      setIsScheduleOpen(true);
    }
  }, [initialProgramId, openScheduleModalParam]);

  // Handle program selection to pre-fill schedule weekCount
  const handleProgramSelect = (pId: string) => {
    setProgramId(pId);
    const selectedProgram = MOCK_PROGRAMS.find((p) => p.id === pId);
    if (selectedProgram) {
      setWeekCount(selectedProgram.weekCount); // Acceptance Criterion 1: Pre-fills schedule weekCount from Program default
      setCohortName(`${selectedProgram.name} — Cohort 0${cohorts.length + 5}`);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prog = MOCK_PROGRAMS.find((p) => p.id === programId);
    const instructor = MOCK_USERS.find((u) => u.id === instructorId);

    const newCohort: Cohort = {
      id: `c${String(cohorts.length + 5).padStart(2, '0')}`,
      name: cohortName || `${prog?.name || 'Program'} — Cohort 0${cohorts.length + 5}`,
      programId,
      programName: prog?.name || 'Backend Engineering',
      instructorId,
      instructorName: instructor?.name || 'Dr. Yemi F.',
      startDate,
      weekCount: Number(weekCount),
      learnerCount: 0,
      teamCount: 0,
      status: 'upcoming',
      completionRate: 0,
    };

    setCohorts([newCohort, ...cohorts]);
    setIsScheduleOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] font-body">
      <Nav currentPath="/cohorts" />

      <main className="max-w-[1120px] mx-auto px-4 py-[clamp(4rem,10vh,6rem)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="mono text-[var(--signal)] mb-2">SCHEDULED RUNS</div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight m-0">
              Cohorts
            </h1>
            <p className="text-[var(--dim)] mt-2 max-w-[600px]">
              Scheduled runs of curriculum programs with fixed start dates, rosters, and team branches.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/programs">
              <Button variant="secondary">View Programs</Button>
            </Link>
            <Button variant="primary" onClick={() => setIsScheduleOpen(true)}>
              + Schedule Cohort
            </Button>
          </div>
        </div>

        {/* Cohorts Grid */}
        <div className="space-y-4 mt-8">
          {cohorts.map((cohort) => {
            const weekStatus = calculateCohortWeek(cohort.startDate, cohort.weekCount);

            return (
              <Card key={cohort.id} className="p-6 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px] hover:border-[var(--dim)] transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="mono text-xs text-[var(--dim)]">{cohort.programName}</span>
                      <StatusPill
                        status={cohort.status === 'active' ? 'in-progress' : cohort.status === 'completed' ? 'closed' : 'assigned'}
                        label={cohort.status.toUpperCase()}
                      />
                    </div>

                    <h2 className="font-display text-xl font-bold tracking-tight">
                      <Link href={`/cohorts/${cohort.id}`} className="hover:text-[var(--signal)] transition-colors">
                        {cohort.name}
                      </Link>
                    </h2>

                    <div className="mono text-xs text-[var(--dim)] flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      <span>Instructor: {cohort.instructorName}</span>
                      <span>Launch: {cohort.startDate}</span>
                      <span>{cohort.learnerCount} learners</span>
                      <span>{cohort.teamCount} teams</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <div className="text-right">
                      <div className="mono text-xs text-[var(--dim)]">SCHEDULE POSITION</div>
                      <div className="font-mono text-base font-semibold text-[var(--mark)]">
                        {weekStatus.headerFormatted}
                      </div>
                    </div>

                    <Link href={`/cohorts/${cohort.id}`}>
                      <Button variant="secondary">
                        Open Cohort Workspace →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Schedule Cohort Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[18px] p-6 max-w-lg w-full shadow-2xl">
            <h2 className="font-display text-xl font-bold mb-4">Schedule a New Cohort</h2>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">SELECT PROGRAM *</label>
                <select
                  value={programId}
                  onChange={(e) => handleProgramSelect(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                >
                  {MOCK_PROGRAMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.weekCount} weeks default)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">COHORT RUN NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Engineering — Cohort 08"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono block text-xs mb-1 text-[var(--dim)]">START DATE *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                  />
                </div>

                <div>
                  <label className="mono block text-xs mb-1 text-[var(--dim)]">WEEK COUNT (EDITABLE) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={52}
                    value={weekCount}
                    onChange={(e) => setWeekCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                  />
                </div>
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">LEAD INSTRUCTOR</label>
                <select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                >
                  {MOCK_USERS.filter((u) => u.role === 'instructor').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-[var(--dim)] bg-[var(--ink-3)] p-3 rounded-lg border border-[var(--line)] leading-relaxed">
                <span className="text-[var(--signal)] font-mono font-semibold">Note: </span>
                Creating a Cohort pre-fills the schedule length from the selected Program default ({weekCount} weeks), editable before launch. The current week will be dynamically computed at runtime.
              </p>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsScheduleOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Launch Cohort
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
