'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Nav, Button, CohortPanel, Card, StatusPill } from '@packages/ui';
import { MOCK_COHORTS, MOCK_ROSTER, MOCK_TEAMS, MOCK_USERS } from '../../../lib/mock-data';
import { calculateCohortWeek } from '../../../lib/cohort-utils';
import type { Cohort, RosterMember, Team } from '../../../lib/types';

export default function CohortDetailPage() {
  const params = useParams();
  const cohortId = (params?.id as string) || 'c07';

  // Find Cohort or fallback
  const initialCohort = MOCK_COHORTS.find((c) => c.id === cohortId) || MOCK_COHORTS[0];

  const [cohort, setCohort] = useState<Cohort>(initialCohort);
  const [roster, setRoster] = useState<RosterMember[]>(
    MOCK_ROSTER.filter((r) => r.cohortId === cohort.id || r.cohortId === 'c07')
  );
  const [teams, setTeams] = useState<Team[]>(
    MOCK_TEAMS.filter((t) => t.cohortId === cohort.id || t.cohortId === 'c07')
  );

  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'teams' | 'schedule'>('overview');

  // Dynamic Current Week computation
  const weekStatus = calculateCohortWeek(cohort.startDate, cohort.weekCount);

  // Roster Filter State
  const [rosterFilter, setRosterFilter] = useState<'all' | 'active' | 'removed'>('all');
  const [rosterSearch, setRosterSearch] = useState('');

  // Modals state
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [softRemoveTarget, setSoftRemoveTarget] = useState<RosterMember | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // New Learner Form state
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newGithub, setNewGithub] = useState('');

  // New Team Form state
  const [teamName, setTeamName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Add Learner
  const handleAddLearnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newMember: RosterMember = {
      id: `r_${Date.now()}`,
      cohortId: cohort.id,
      userId: newUserId || `u_${Date.now()}`,
      userName: newUserName,
      userEmail: newUserEmail,
      githubUsername: newGithub || newUserName.toLowerCase().replace(/\s+/g, '-'),
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    const updatedRoster = [...roster, newMember];
    setRoster(updatedRoster);

    const activeCount = updatedRoster.filter((r) => r.status === 'active').length;
    setCohort({ ...cohort, learnerCount: activeCount });

    setIsAddLearnerOpen(false);
    setNewUserId('');
    setNewUserName('');
    setNewUserEmail('');
    setNewGithub('');
  };

  // Confirm Soft-Removal (Acceptance Criterion 3)
  const handleConfirmSoftRemove = () => {
    if (!softRemoveTarget) return;

    const updatedRoster = roster.map((r) =>
      r.id === softRemoveTarget.id
        ? { ...r, status: 'removed' as const, removedAt: new Date().toISOString().split('T')[0] }
        : r
    );

    setRoster(updatedRoster);

    const activeCount = updatedRoster.filter((r) => r.status === 'active').length;
    setCohort({ ...cohort, learnerCount: activeCount });

    setSoftRemoveTarget(null);
  };

  // Create Team
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const selectedMembers = roster.filter((r) => selectedMemberIds.includes(r.userId));

    if (editingTeam) {
      setTeams(
        teams.map((t) =>
          t.id === editingTeam.id
            ? {
                ...t,
                name: teamName,
                memberIds: selectedMemberIds,
                memberNames: selectedMembers.map((m) => m.userName),
              }
            : t
        )
      );
      setEditingTeam(null);
    } else {
      const newTeam: Team = {
        id: `t_${Date.now()}`,
        cohortId: cohort.id,
        name: teamName,
        memberIds: selectedMemberIds,
        memberNames: selectedMembers.map((m) => m.userName),
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updatedTeams = [...teams, newTeam];
      setTeams(updatedTeams);
      setCohort({ ...cohort, teamCount: updatedTeams.length });
    }

    setIsCreateTeamOpen(false);
    setTeamName('');
    setSelectedMemberIds([]);
  };

  // Filtered Roster
  const filteredRoster = roster.filter((m) => {
    if (rosterFilter !== 'all' && m.status !== rosterFilter) return false;
    if (rosterSearch) {
      const query = rosterSearch.toLowerCase();
      return (
        m.userName.toLowerCase().includes(query) ||
        m.userEmail.toLowerCase().includes(query) ||
        (m.githubUsername && m.githubUsername.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--chalk)] font-body">
      <Nav currentPath="/cohorts" />

      <main className="max-w-[1120px] mx-auto px-4 py-[clamp(3rem,8vh,5rem)]">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mono text-[var(--dim)] mb-4">
          <Link href="/cohorts" className="hover:text-[var(--signal)]">COHORTS</Link>
          <span>/</span>
          <span className="text-[var(--chalk)]">{cohort.name}</span>
        </div>

        {/* Cohort Panel Header Primitive */}
        <CohortPanel
          cohortName={cohort.name}
          learnersCount={cohort.learnerCount}
          teamsCount={cohort.teamCount}
          currentWeek={weekStatus.currentWeek}
          totalWeeks={cohort.weekCount}
          managerLog={
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--signal)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--signal)]"></span>
              </span>
              <span className="font-mono text-[var(--signal)] uppercase">MANAGER:</span>
              <span className="text-[var(--chalk)]">
                Cohort schedule active on Week {weekStatus.currentWeek} of {cohort.weekCount}. Roster health synchronized across {teams.length} teams.
              </span>
            </div>
          }
        >
          <div className="py-2 text-xs text-[var(--dim)] flex flex-wrap gap-x-6 gap-y-1">
            <span>Program: <strong className="text-[var(--chalk)]">{cohort.programName}</strong></span>
            <span>Instructor: <strong className="text-[var(--chalk)]">{cohort.instructorName}</strong></span>
            <span>Launch Date: <strong className="text-[var(--chalk)]">{cohort.startDate}</strong></span>
            <span>Status: <strong className="text-[var(--mark)] uppercase">{cohort.status}</strong></span>
          </div>
        </CohortPanel>

        {/* Tabs Navigation */}
        <div className="flex border-b border-[var(--line)] mt-8 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-mono text-xs uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[var(--signal)] text-[var(--signal)]'
                : 'border-transparent text-[var(--dim)] hover:text-[var(--chalk)]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-3 font-mono text-xs uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'roster'
                ? 'border-[var(--signal)] text-[var(--signal)]'
                : 'border-transparent text-[var(--dim)] hover:text-[var(--chalk)]'
            }`}
          >
            Roster ({roster.filter((r) => r.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-3 font-mono text-xs uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'teams'
                ? 'border-[var(--signal)] text-[var(--signal)]'
                : 'border-transparent text-[var(--dim)] hover:text-[var(--chalk)]'
            }`}
          >
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-3 font-mono text-xs uppercase font-semibold transition-colors border-b-2 ${
              activeTab === 'schedule'
                ? 'border-[var(--signal)] text-[var(--signal)]'
                : 'border-transparent text-[var(--dim)] hover:text-[var(--chalk)]'
            }`}
          >
            Schedule & Weeks
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px]">
              <div className="mono text-xs text-[var(--dim)] mb-1">COHORT PROGRESS</div>
              <div className="font-display text-3xl font-extrabold text-[var(--signal)]">
                {cohort.completionRate}%
              </div>
              <div className="w-full bg-[var(--ink-3)] h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[var(--signal)] h-full rounded-full"
                  style={{ width: `${cohort.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-[var(--dim)] mt-3">
                Overall completion rate calculated across all team tasks.
              </p>
            </Card>

            <Card className="p-6 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px]">
              <div className="mono text-xs text-[var(--dim)] mb-1">CURRENT SCHEDULE</div>
              <div className="font-display text-2xl font-bold text-[var(--mark)]">
                {weekStatus.headerFormatted}
              </div>
              <div className="mono text-xs text-[var(--dim)] mt-2">
                Launch: {cohort.startDate}
              </div>
              <p className="text-xs text-[var(--dim)] mt-3">
                Current week updates automatically at week boundaries across timezones.
              </p>
            </Card>

            <Card className="p-6 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px]">
              <div className="mono text-xs text-[var(--dim)] mb-1">ROSTER & TEAMS</div>
              <div className="font-display text-2xl font-bold text-[var(--chalk)]">
                {cohort.learnerCount} Learners · {cohort.teamCount} Teams
              </div>
              <div className="mono text-xs text-[var(--dim)] mt-2">
                Target Team Size: 3–5 learners per team
              </div>
              <p className="text-xs text-[var(--dim)] mt-3">
                All learners work in team branches managed by the AI manager.
              </p>
            </Card>
          </div>
        )}

        {/* TAB 2: ROSTER */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--ink-2)] p-4 rounded-[14px] border border-[var(--line)]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search learners or github..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-1.5 text-xs text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)] w-60"
                />

                <div className="flex rounded-lg border border-[var(--line)] overflow-hidden">
                  <button
                    onClick={() => setRosterFilter('all')}
                    className={`px-3 py-1 text-xs font-mono ${
                      rosterFilter === 'all'
                        ? 'bg-[var(--ink-3)] text-[var(--signal)]'
                        : 'text-[var(--dim)] hover:text-[var(--chalk)]'
                    }`}
                  >
                    All ({roster.length})
                  </button>
                  <button
                    onClick={() => setRosterFilter('active')}
                    className={`px-3 py-1 text-xs font-mono border-l border-[var(--line)] ${
                      rosterFilter === 'active'
                        ? 'bg-[var(--ink-3)] text-[var(--signal)]'
                        : 'text-[var(--dim)] hover:text-[var(--chalk)]'
                    }`}
                  >
                    Active ({roster.filter((r) => r.status === 'active').length})
                  </button>
                  <button
                    onClick={() => setRosterFilter('removed')}
                    className={`px-3 py-1 text-xs font-mono border-l border-[var(--line)] ${
                      rosterFilter === 'removed'
                        ? 'bg-[var(--ink-3)] text-[var(--mark)]'
                        : 'text-[var(--dim)] hover:text-[var(--chalk)]'
                    }`}
                  >
                    Removed ({roster.filter((r) => r.status === 'removed').length})
                  </button>
                </div>
              </div>

              <Button variant="primary" onClick={() => setIsAddLearnerOpen(true)}>
                + Add Learner to Roster
              </Button>
            </div>

            {/* Roster Table */}
            <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--ink-3)] border-b border-[var(--line)] font-mono text-[var(--dim)]">
                  <tr>
                    <th className="p-3">LEARNER</th>
                    <th className="p-3">GITHUB HANDLE</th>
                    <th className="p-3">TEAM ASSIGNMENT</th>
                    <th className="p-3">JOINED</th>
                    <th className="p-3">ROSTER STATUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {filteredRoster.map((member) => (
                    <tr key={member.id} className="hover:bg-[var(--ink-3)]/50 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-[var(--chalk)]">{member.userName}</div>
                        <div className="text-[var(--dim)] text-[0.7rem]">{member.userEmail}</div>
                      </td>
                      <td className="p-3 font-mono">
                        {member.githubUsername ? (
                          <span className="bg-[var(--ink-3)] px-2 py-0.5 rounded border border-[var(--line)] text-[var(--signal)]">
                            @{member.githubUsername}
                          </span>
                        ) : (
                          <span className="text-[var(--dim)]">—</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {member.teamName ? (
                          <span className="text-[var(--chalk)]">{member.teamName}</span>
                        ) : (
                          <span className="text-[var(--dim)]">Unassigned</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[var(--dim)]">{member.joinedAt}</td>
                      <td className="p-3 font-mono">
                        {member.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 text-[var(--signal)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[var(--mark)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--mark)]"></span>
                            REMOVED ({member.removedAt})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {member.status === 'active' && (
                          <button
                            onClick={() => setSoftRemoveTarget(member)}
                            className="text-xs text-[var(--mark)] hover:underline font-mono"
                          >
                            Soft Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--dim)] font-mono">
                        No roster members found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TEAMS */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[var(--ink-2)] p-4 rounded-[14px] border border-[var(--line)]">
              <div>
                <h3 className="font-display font-bold text-base">Cohort Teams (3–5 Learners)</h3>
                <p className="text-xs text-[var(--dim)]">
                  Teams own tasks and repository branches together under AI manager oversight.
                </p>
              </div>

              <Button variant="primary" onClick={() => setIsCreateTeamOpen(true)}>
                + Create Team
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => {
                const memberCount = t.memberIds.length;
                const isSizeValid = memberCount >= 3 && memberCount <= 5;

                return (
                  <Card key={t.id} className="p-5 bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-display font-semibold text-lg">{t.name}</h4>
                        <span
                          className={`mono text-[0.68rem] px-2 py-0.5 rounded border ${
                            isSizeValid
                              ? 'bg-[var(--signal)]/10 text-[var(--signal)] border-[var(--signal)]/30'
                              : 'bg-[var(--mark)]/10 text-[var(--mark)] border-[var(--mark)]/30'
                          }`}
                        >
                          {isSizeValid ? '3–5 learners ok' : `Size Warn (${memberCount})`}
                        </span>
                      </div>

                      <div className="space-y-1.5 my-4">
                        <div className="mono text-[0.7rem] text-[var(--dim)] uppercase">MEMBERS ({memberCount})</div>
                        {t.memberNames.map((name, idx) => (
                          <div key={idx} className="text-xs flex items-center justify-between bg-[var(--ink-3)] px-3 py-1.5 rounded border border-[var(--line)]">
                            <span className="text-[var(--chalk)]">{name}</span>
                            <span className="mono text-[0.65rem] text-[var(--signal)]">Contributor</span>
                          </div>
                        ))}
                        {memberCount === 0 && (
                          <div className="text-xs text-[var(--dim)] italic">No members assigned</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[var(--line)] flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingTeam(t);
                          setTeamName(t.name);
                          setSelectedMemberIds(t.memberIds);
                          setIsCreateTeamOpen(true);
                        }}
                      >
                        Manage Members
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[14px] p-6 space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg">Cohort Schedule Timeline</h3>
              <p className="text-xs text-[var(--dim)]">
                Launch date: <strong className="text-[var(--chalk)]">{cohort.startDate}</strong> · Total schedule: <strong className="text-[var(--chalk)]">{cohort.weekCount} Weeks</strong>
              </p>
            </div>

            <div className="space-y-3">
              {Array.from({ length: cohort.weekCount }, (_, i) => {
                const weekNum = i + 1;
                const isCurrent = weekNum === weekStatus.currentWeek;
                const isPast = weekNum < weekStatus.currentWeek;

                return (
                  <div
                    key={weekNum}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      isCurrent
                        ? 'border-[var(--mark)] bg-[var(--mark)]/5'
                        : isPast
                        ? 'border-[var(--signal)]/30 bg-[var(--ink-3)]'
                        : 'border-[var(--line)] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`font-mono text-sm font-bold w-16 ${isCurrent ? 'text-[var(--mark)]' : isPast ? 'text-[var(--signal)]' : 'text-[var(--dim)]'}`}>
                        WEEK {weekNum}
                      </div>

                      <div>
                        <div className="font-semibold text-sm">
                          {isCurrent ? `Week ${weekNum} — In Progress (NOW)` : isPast ? `Week ${weekNum} — Completed` : `Week ${weekNum} — Scheduled`}
                        </div>
                        <div className="text-xs text-[var(--dim)]">
                          {isPast
                            ? 'All team git tasks closed and graded.'
                            : isCurrent
                            ? 'AI manager actively watching branch pushes and peer reviews.'
                            : 'Upcoming curriculum tasks will open at week boundary.'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isCurrent && (
                        <span className="mono text-xs text-[var(--mark)] font-semibold border border-[var(--mark)] px-3 py-1 rounded-full animate-pulse">
                          NOW MOMENT
                        </span>
                      )}
                      {isPast && (
                        <span className="mono text-xs text-[var(--signal)] border border-[var(--signal)]/40 px-3 py-1 rounded-full">
                          PASSED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Add Learner Modal */}
      {isAddLearnerOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[18px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-xl font-bold mb-4">Add Learner to Cohort Roster</h3>

            <form onSubmit={handleAddLearnerSubmit} className="space-y-4">
              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chisom E."
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. chisom@mgs.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">GITHUB USERNAME (FOR COMMIT ATTRIBUTION)</label>
                <input
                  type="text"
                  placeholder="e.g. chisom-dev"
                  value={newGithub}
                  onChange={(e) => setNewGithub(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--line)]">
                <Button type="button" variant="secondary" onClick={() => setIsAddLearnerOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add to Roster
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft Remove Confirmation Modal (Acceptance Criterion 3) */}
      {softRemoveTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--ink-2)] border border-[var(--mark)]/50 rounded-[18px] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="mono text-xs text-[var(--mark)] font-semibold uppercase">
              CONFIRM ROSTER SOFT-REMOVAL
            </div>

            <h3 className="font-display text-xl font-bold text-[var(--chalk)]">
              Remove {softRemoveTarget.userName} from Roster?
            </h3>

            <p className="text-sm text-[var(--dim)] leading-relaxed bg-[var(--ink-3)] p-3 rounded-lg border border-[var(--line)]">
              <strong className="text-[var(--chalk)]">Acceptance Rule:</strong> Removing a learner mid-cohort soft-removes them from the roster (<span className="font-mono text-[var(--mark)]">status: removed</span>). Their historical task submissions, git commits, and contribution metrics will be preserved and will <em className="text-[var(--chalk)] font-normal">never</em> be deleted.
            </p>

            <div className="flex gap-3 justify-end pt-4 border-t border-[var(--line)]">
              <Button variant="secondary" onClick={() => setSoftRemoveTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmSoftRemove}>
                Confirm Soft Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Manage Team Modal */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--ink-2)] border border-[var(--line)] rounded-[18px] p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-xl font-bold mb-4">
              {editingTeam ? `Manage ${editingTeam.name}` : 'Create Cohort Team'}
            </h3>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">TEAM NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Team 10"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[var(--ink-3)] border border-[var(--line)] rounded-lg px-3 py-2 text-sm text-[var(--chalk)] focus:outline-none focus:border-[var(--signal)]"
                />
              </div>

              <div>
                <label className="mono block text-xs mb-1 text-[var(--dim)]">
                  SELECT MEMBERS (RECOMMENDED 3–5 LEARNERS)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[var(--line)] p-2 rounded-lg bg-[var(--ink-3)]">
                  {roster.filter((r) => r.status === 'active').map((member) => (
                    <label key={member.userId} className="flex items-center gap-2 p-1.5 hover:bg-[var(--ink-2)] rounded cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMemberIds([...selectedMemberIds, member.userId]);
                          } else {
                            setSelectedMemberIds(selectedMemberIds.filter((id) => id !== member.userId));
                          }
                        }}
                        className="rounded border-[var(--line)] text-[var(--signal)] focus:ring-0"
                      />
                      <span>{member.userName} ({member.userEmail})</span>
                    </label>
                  ))}
                </div>
                <div className="mono text-[0.7rem] mt-1 text-[var(--dim)] flex justify-between">
                  <span>Selected: {selectedMemberIds.length} members</span>
                  <span className={selectedMemberIds.length >= 3 && selectedMemberIds.length <= 5 ? 'text-[var(--signal)]' : 'text-[var(--mark)]'}>
                    {selectedMemberIds.length >= 3 && selectedMemberIds.length <= 5 ? 'Target 3–5 met' : 'Target is 3–5 members'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--line)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreateTeamOpen(false);
                    setEditingTeam(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingTeam ? 'Save Team' : 'Create Team'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
