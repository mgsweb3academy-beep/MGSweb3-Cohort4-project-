'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Nav, Button, Card } from '@packages/ui';
import { MOCK_PROGRAMS, MOCK_COURSES, MOCK_COHORTS } from '../../lib/mock-data';
import type { Program } from '../../lib/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(MOCK_PROGRAMS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [weekCount, setWeekCount] = useState(8);

  const handleOpenCreate = () => {
    setName('');
    setCode('');
    setDescription('');
    setWeekCount(8);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Program) => {
    setEditingProgram(p);
    setName(p.name);
    setCode(p.code || '');
    setDescription(p.description);
    setWeekCount(p.weekCount);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProgram) {
      setPrograms(
        programs.map((p) =>
          p.id === editingProgram.id
            ? { ...p, name, code, description, weekCount: Number(weekCount), updatedAt: new Date().toISOString() }
            : p
        )
      );
      setEditingProgram(null);
    } else {
      const newProg: Program = {
        id: `p_${Date.now()}`,
        name,
        code: code || `PROG-${Math.floor(100 + Math.random() * 900)}`,
        description,
        weekCount: Number(weekCount),
        courseIds: [],
        cohortIds: [],
        createdAt: new Date().toISOString(),
      };
      setPrograms([...programs, newProg]);
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] font-body">
      <Nav currentPath="/programs" />

      <main className="max-w-[1120px] mx-auto px-4 py-[clamp(4rem,10vh,6rem)]">
        {/* Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="mono text-[var(--signal)] mb-2">CURRICULUM SHELLS</div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight m-0">
              Programs
            </h1>
            <p className="text-[var(--dim)] mt-2 max-w-[600px]">
              Reusable curriculum blueprints defining default schedule length, target courses, and historical cohorts.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/cohorts">
              <Button variant="secondary">View Cohorts</Button>
            </Link>
            <Button variant="primary" onClick={handleOpenCreate}>
              + Create Program
            </Button>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {programs.map((prog) => {
            const courseCount = MOCK_COURSES.filter((c) => c.programId === prog.id).length;
            const cohortCount = MOCK_COHORTS.filter((c) => c.programId === prog.id).length;

            return (
              <Card key={prog.id} className="flex flex-col justify-between p-6 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px]">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="mono text-[0.72rem] tracking-[0.1em] text-[var(--dim)] bg-[var(--ink-3)] px-2 py-1 rounded border border-[var(--line)]">
                      {prog.code || 'PROGRAM'}
                    </span>
                    <span className="mono text-[0.75rem] text-[var(--mark)]">
                      {prog.weekCount} Weeks Schedule
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold mb-2">{prog.name}</h3>
                  <p className="text-[var(--dim)] text-sm mb-6 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--line)] mb-6 text-center">
                    <div>
                      <div className="mono text-[0.68rem] text-[var(--dim)]">DEFAULT DURATION</div>
                      <div className="font-mono text-base text-[var(--chalk)] mt-1">{prog.weekCount} Weeks</div>
                    </div>
                    <div>
                      <div className="mono text-[0.68rem] text-[var(--dim)] font-mono">COURSES</div>
                      <div className="font-mono text-base text-[var(--chalk)] mt-1">{courseCount}</div>
                    </div>
                    <div>
                      <div className="mono text-[0.68rem] text-[var(--dim)]">COHORTS RUN</div>
                      <div className="font-mono text-base text-[var(--chalk)] mt-1">{cohortCount}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => handleOpenEdit(prog)}>
                      Edit Shell
                    </Button>
                    <Link href={`/cohorts?programId=${prog.id}&schedule=true`}>
                      <Button variant="primary">
                        Schedule Cohort
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Modal for Create/Edit Program */}
      {(isCreateOpen || editingProgram) && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[18px] p-6 max-w-md w-full shadow-2xl">
            <h2 className="font-display text-xl font-bold mb-4">
              {editingProgram ? 'Edit Program Shell' : 'Create New Program'}
            </h2>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">PROGRAM NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">PROGRAM CODE / IDENTIFIER</label>
                <input
                  type="text"
                  placeholder="e.g. BE-101"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Summary of target learning outcomes and repository projects..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">DEFAULT SCHEDULE WEEKS *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={52}
                  value={weekCount}
                  onChange={(e) => setWeekCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
                <p className="text-[0.75rem] text-[var(--dim)] mt-1">
                  When scheduling a new cohort, this week count will be pre-filled as default.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingProgram(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingProgram ? 'Save Changes' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
