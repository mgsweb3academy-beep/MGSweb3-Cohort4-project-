import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Cohort, Team, RosterMember } from 'types';
import { ProgramsService } from '../programs/programs.service';

@Injectable()
export class CohortsService {
  constructor(
    @Inject(ProgramsService)
    private readonly programsService: ProgramsService
  ) {}

  private cohorts: Cohort[] = [
    {
      id: 'c07',
      name: 'Backend Engineering — Cohort 07',
      programId: 'p1',
      programName: 'Backend Engineering',
      instructorId: 'u8',
      instructorName: 'Dr. Yemi F.',
      startDate: '2025-01-13',
      weekCount: 8,
      learnerCount: 41,
      teamCount: 9,
      status: 'active',
      completionRate: 62,
    },
    {
      id: 'c06',
      name: 'Backend Engineering — Cohort 06',
      programId: 'p1',
      programName: 'Backend Engineering',
      instructorId: 'u8',
      instructorName: 'Dr. Yemi F.',
      startDate: '2024-09-09',
      weekCount: 8,
      learnerCount: 38,
      teamCount: 8,
      status: 'completed',
      completionRate: 89,
    },
    {
      id: 'c05',
      name: 'Web3 Foundations — Cohort 05',
      programId: 'p2',
      programName: 'Web3 Foundations',
      instructorId: 'u9',
      instructorName: 'Bayo L.',
      startDate: '2024-06-03',
      weekCount: 6,
      learnerCount: 29,
      teamCount: 6,
      status: 'completed',
      completionRate: 93,
    },
  ];

  private roster: RosterMember[] = [
    { id: 'r1', cohortId: 'c07', userId: 'u1', userName: 'Adaeze O.', userEmail: 'adaeze@mgs.io', githubUsername: 'adaeze-o', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
    { id: 'r2', cohortId: 'c07', userId: 'u2', userName: 'Marcus B.', userEmail: 'marcus@mgs.io', githubUsername: 'marcus-b', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
    { id: 'r3', cohortId: 'c07', userId: 'u3', userName: 'Priya N.', userEmail: 'priya@mgs.io', githubUsername: 'priya-n', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
    { id: 'r4', cohortId: 'c07', userId: 'u4', userName: 'Tobi A.', userEmail: 'tobi@mgs.io', githubUsername: 'tobi-a', teamId: 't4', teamName: 'Team 4', joinedAt: '2025-01-13', status: 'active' },
    { id: 'r5', cohortId: 'c07', userId: 'u5', userName: 'Ini E.', userEmail: 'ini@mgs.io', githubUsername: 'ini-e', teamId: 't5', teamName: 'Team 5', joinedAt: '2025-01-13', status: 'active' },
    { id: 'r6', cohortId: 'c07', userId: 'u6', userName: 'Sam K.', userEmail: 'sam@mgs.io', githubUsername: 'sam-k', teamId: undefined, teamName: undefined, joinedAt: '2025-01-13', status: 'removed', removedAt: '2025-03-01' },
    { id: 'r7', cohortId: 'c07', userId: 'u7', userName: 'Zainab M.', userEmail: 'zainab@mgs.io', githubUsername: 'zainab-m', teamId: 't5', teamName: 'Team 5', joinedAt: '2025-01-13', status: 'active' },
  ];

  private teams: Team[] = [
    { id: 't1', cohortId: 'c07', name: 'Team 1', memberIds: ['u10', 'u11', 'u12', 'u13'], memberNames: ['Learner 10', 'Learner 11', 'Learner 12', 'Learner 13'], createdAt: '2025-01-13' },
    { id: 't2', cohortId: 'c07', name: 'Team 2', memberIds: ['u14', 'u15', 'u16', 'u17'], memberNames: ['Learner 14', 'Learner 15', 'Learner 16', 'Learner 17'], createdAt: '2025-01-13' },
    { id: 't3', cohortId: 'c07', name: 'Team 3', memberIds: ['u18', 'u19', 'u20', 'u21'], memberNames: ['Learner 18', 'Learner 19', 'Learner 20', 'Learner 21'], createdAt: '2025-01-13' },
    { id: 't4', cohortId: 'c07', name: 'Team 4', memberIds: ['u1', 'u2', 'u3', 'u4'], memberNames: ['Adaeze O.', 'Marcus B.', 'Priya N.', 'Tobi A.'], createdAt: '2025-01-13' },
    { id: 't5', cohortId: 'c07', name: 'Team 5', memberIds: ['u5', 'u7', 'u22', 'u23'], memberNames: ['Ini E.', 'Zainab M.', 'Learner 22', 'Learner 23'], createdAt: '2025-01-13' },
    { id: 't6', cohortId: 'c07', name: 'Team 6', memberIds: ['u24', 'u25', 'u26', 'u27'], memberNames: ['Learner 24', 'Learner 25', 'Learner 26', 'Learner 27'], createdAt: '2025-01-13' },
    { id: 't7', cohortId: 'c07', name: 'Team 7', memberIds: ['u28', 'u29', 'u30', 'u31'], memberNames: ['Learner 28', 'Learner 29', 'Learner 30', 'Learner 31'], createdAt: '2025-01-13' },
    { id: 't8', cohortId: 'c07', name: 'Team 8', memberIds: ['u32', 'u33', 'u34', 'u35'], memberNames: ['Learner 32', 'Learner 33', 'Learner 34', 'Learner 35'], createdAt: '2025-01-13' },
    { id: 't9', cohortId: 'c07', name: 'Team 9', memberIds: ['u36', 'u37', 'u38', 'u39', 'u40'], memberNames: ['Learner 36', 'Learner 37', 'Learner 38', 'Learner 39', 'Learner 40'], createdAt: '2025-01-13' },
  ];

  /**
   * Helper to compute dynamic current week from start date
   */
  private computeCurrentWeek(startDateStr: string, weekCount: number): number {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diff = today.getTime() - start.getTime();

    if (diff < 0) return 0;
    const calculated = Math.floor(diff / msPerWeek) + 1;
    return Math.min(weekCount, Math.max(1, calculated));
  }

  findAll(): Cohort[] {
    return this.cohorts.map((c) => ({
      ...c,
      currentWeek: this.computeCurrentWeek(c.startDate, c.weekCount),
    }));
  }

  findOne(id: string): Cohort {
    const cohort = this.cohorts.find((c) => c.id === id);
    if (!cohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    return {
      ...cohort,
      currentWeek: this.computeCurrentWeek(cohort.startDate, cohort.weekCount),
    };
  }

  /**
   * Schedule a new Cohort against a Program. Pre-fills default weekCount from Program if omitted.
   */
  create(data: {
    name: string;
    programId: string;
    startDate: string;
    weekCount?: number;
    instructorId?: string;
    instructorName?: string;
  }): Cohort {
    const program = this.programsService.findOne(data.programId);
    const finalWeekCount = data.weekCount ? Number(data.weekCount) : program.weekCount;

    const newCohort: Cohort = {
      id: `c${String(this.cohorts.length + 5).padStart(2, '0')}`,
      name: data.name || `${program.name} — Cohort ${String(this.cohorts.length + 1).padStart(2, '0')}`,
      programId: program.id,
      programName: program.name,
      instructorId: data.instructorId || 'u8',
      instructorName: data.instructorName || 'Dr. Yemi F.',
      startDate: data.startDate,
      weekCount: finalWeekCount,
      learnerCount: 0,
      teamCount: 0,
      status: 'upcoming',
      completionRate: 0,
    };

    this.cohorts.push(newCohort);

    if (!program.cohortIds.includes(newCohort.id)) {
      program.cohortIds.push(newCohort.id);
    }

    return {
      ...newCohort,
      currentWeek: this.computeCurrentWeek(newCohort.startDate, newCohort.weekCount),
    };
  }

  update(id: string, data: Partial<Cohort>): Cohort {
    const cohort = this.cohorts.find((c) => c.id === id);
    if (!cohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    if (data.name) cohort.name = data.name;
    if (data.startDate) cohort.startDate = data.startDate;
    if (data.weekCount) cohort.weekCount = Number(data.weekCount);
    if (data.instructorId) cohort.instructorId = data.instructorId;
    if (data.instructorName) cohort.instructorName = data.instructorName;
    if (data.status) cohort.status = data.status;

    return {
      ...cohort,
      currentWeek: this.computeCurrentWeek(cohort.startDate, cohort.weekCount),
    };
  }

  // --- Roster Management ---

  getRoster(cohortId: string): RosterMember[] {
    this.findOne(cohortId);
    return this.roster.filter((r) => r.cohortId === cohortId);
  }

  addLearnerToRoster(
    cohortId: string,
    data: { userId: string; userName: string; userEmail: string; githubUsername?: string }
  ): RosterMember {
    const cohort = this.findOne(cohortId);
    const existing = this.roster.find((r) => r.cohortId === cohortId && r.userId === data.userId);

    if (existing) {
      if (existing.status === 'removed') {
        existing.status = 'active';
        existing.removedAt = undefined;
        return existing;
      }
      throw new BadRequestException('Learner is already active in this cohort roster');
    }

    const newMember: RosterMember = {
      id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      cohortId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      githubUsername: data.githubUsername,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    this.roster.push(newMember);

    const activeCount = this.roster.filter((r) => r.cohortId === cohortId && r.status === 'active').length;
    const realCohort = this.cohorts.find((c) => c.id === cohortId);
    if (realCohort) realCohort.learnerCount = activeCount;

    return newMember;
  }

  /**
   * Soft-removes a learner from a roster mid-cohort.
   * Preserves their historical task/contribution records.
   */
  softRemoveLearner(cohortId: string, userId: string): RosterMember {
    const member = this.roster.find((r) => r.cohortId === cohortId && r.userId === userId);
    if (!member) {
      throw new NotFoundException(`Roster member not found for user ${userId} in cohort ${cohortId}`);
    }

    member.status = 'removed';
    member.removedAt = new Date().toISOString();

    const activeCount = this.roster.filter((r) => r.cohortId === cohortId && r.status === 'active').length;
    const realCohort = this.cohorts.find((c) => c.id === cohortId);
    if (realCohort) realCohort.learnerCount = activeCount;

    return member;
  }

  // --- Team Management ---

  getTeams(cohortId: string): Team[] {
    this.findOne(cohortId);
    return this.teams.filter((t) => t.cohortId === cohortId);
  }

  createTeam(cohortId: string, data: { name: string; memberIds?: string[]; memberNames?: string[] }): Team {
    this.findOne(cohortId);
    const newTeam: Team = {
      id: `t_${Date.now()}`,
      cohortId,
      name: data.name || `Team ${this.teams.filter((t) => t.cohortId === cohortId).length + 1}`,
      memberIds: data.memberIds || [],
      memberNames: data.memberNames || [],
      createdAt: new Date().toISOString(),
    };

    this.teams.push(newTeam);

    const realCohort = this.cohorts.find((c) => c.id === cohortId);
    if (realCohort) {
      realCohort.teamCount = this.teams.filter((t) => t.cohortId === cohortId).length;
    }

    return newTeam;
  }

  updateTeam(
    cohortId: string,
    teamId: string,
    data: { name?: string; memberIds?: string[]; memberNames?: string[] }
  ): Team {
    const team = this.teams.find((t) => t.cohortId === cohortId && t.id === teamId);
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found in cohort ${cohortId}`);
    }

    if (data.name) team.name = data.name;
    if (data.memberIds) team.memberIds = data.memberIds;
    if (data.memberNames) team.memberNames = data.memberNames;

    return team;
  }

  deleteTeam(cohortId: string, teamId: string): { success: boolean } {
    const index = this.teams.findIndex((t) => t.cohortId === cohortId && t.id === teamId);
    if (index === -1) {
      throw new NotFoundException(`Team ${teamId} not found in cohort ${cohortId}`);
    }

    this.teams.splice(index, 1);

    const realCohort = this.cohorts.find((c) => c.id === cohortId);
    if (realCohort) {
      realCohort.teamCount = this.teams.filter((t) => t.cohortId === cohortId).length;
    }

    return { success: true };
  }
}
