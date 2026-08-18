import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Cohort, Team, RosterMember } from 'types';
import { ProgramsService } from '../programs/programs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CohortsService {
  constructor(
    @Inject(ProgramsService)
    private readonly programsService: ProgramsService,
    private prisma: PrismaService,
  ) {}

  private computeCurrentWeek(startDate: Date, weekCount: number): number {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const diff = today.getTime() - start.getTime();

    if (diff < 0) return 0;
    const calculated = Math.floor(diff / msPerWeek) + 1;
    return Math.min(weekCount, Math.max(1, calculated));
  }

  async findAll() {
    const cohorts = await this.prisma.cohort.findMany();
    return cohorts.map((c) => ({
      ...c,
      currentWeek: this.computeCurrentWeek(c.startDate, c.weekCount),
    }));
  }

  async findOne(id: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    return {
      ...cohort,
      currentWeek: this.computeCurrentWeek(cohort.startDate, cohort.weekCount),
    };
  }

  async create(data: {
    name: string;
    programId: string;
    startDate: string;
    weekCount?: number;
    instructorId?: string;
    instructorName?: string;
  }) {
    // Basic mock program lookup fallback for demo purposes since ProgramsService is mock
    const program = { id: data.programId, name: 'Demo Program', weekCount: 8 };
    const finalWeekCount = data.weekCount ? Number(data.weekCount) : program.weekCount;

    const newCohort = await this.prisma.cohort.create({
      data: {
        name: data.name,
        programId: program.id,
        programName: program.name,
        instructorId: data.instructorId || 'u8',
        instructorName: data.instructorName || 'Dr. Yemi F.',
        startDate: new Date(data.startDate),
        weekCount: finalWeekCount,
        status: 'upcoming',
      },
    });

    return {
      ...newCohort,
      currentWeek: this.computeCurrentWeek(newCohort.startDate, newCohort.weekCount),
    };
  }

  async update(id: string, data: Partial<Cohort>) {
    const updated = await this.prisma.cohort.update({
      where: { id },
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        weekCount: data.weekCount ? Number(data.weekCount) : undefined,
        instructorId: data.instructorId,
        instructorName: data.instructorName,
        status: data.status,
      },
    });

    return {
      ...updated,
      currentWeek: this.computeCurrentWeek(updated.startDate, updated.weekCount),
    };
  }

  async getRoster(cohortId: string) {
    return this.prisma.rosterMember.findMany({ where: { cohortId } });
  }

  async addLearnerToRoster(
    cohortId: string,
    data: { userId: string; userName: string; userEmail: string; githubUsername?: string }
  ) {
    const existing = await this.prisma.rosterMember.findFirst({
      where: { cohortId, userId: data.userId },
    });

    if (existing) {
      if (existing.status === 'removed') {
        return this.prisma.rosterMember.update({
          where: { id: existing.id },
          data: { status: 'active', removedAt: null },
        });
      }
      throw new BadRequestException('Learner is already active in this cohort roster');
    }

    const member = await this.prisma.rosterMember.create({
      data: {
        cohortId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        githubUsername: data.githubUsername,
        status: 'active',
      },
    });

    // Update active count
    const activeCount = await this.prisma.rosterMember.count({
      where: { cohortId, status: 'active' },
    });
    await this.prisma.cohort.update({ where: { id: cohortId }, data: { learnerCount: activeCount } });

    return member;
  }

  async softRemoveLearner(cohortId: string, userId: string) {
    const existing = await this.prisma.rosterMember.findFirst({
      where: { cohortId, userId },
    });

    if (!existing) {
      throw new NotFoundException(`Roster member not found`);
    }

    const member = await this.prisma.rosterMember.update({
      where: { id: existing.id },
      data: { status: 'removed', removedAt: new Date() },
    });

    const activeCount = await this.prisma.rosterMember.count({
      where: { cohortId, status: 'active' },
    });
    await this.prisma.cohort.update({ where: { id: cohortId }, data: { learnerCount: activeCount } });

    return member;
  }

  async getTeams(cohortId: string) {
    return this.prisma.team.findMany({ where: { cohortId } });
  }

  async createTeam(cohortId: string, data: { name: string; memberIds?: string[]; memberNames?: string[] }) {
    const team = await this.prisma.team.create({
      data: {
        cohortId,
        name: data.name,
        memberIds: data.memberIds || [],
        memberNames: data.memberNames || [],
      },
    });

    const teamCount = await this.prisma.team.count({ where: { cohortId } });
    await this.prisma.cohort.update({ where: { id: cohortId }, data: { teamCount } });

    return team;
  }

  async updateTeam(
    cohortId: string,
    teamId: string,
    data: { name?: string; memberIds?: string[]; memberNames?: string[] }
  ) {
    return this.prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        memberIds: data.memberIds,
        memberNames: data.memberNames,
      },
    });
  }

  async deleteTeam(cohortId: string, teamId: string) {
    await this.prisma.team.delete({ where: { id: teamId } });
    const teamCount = await this.prisma.team.count({ where: { cohortId } });
    await this.prisma.cohort.update({ where: { id: cohortId }, data: { teamCount } });
    return { success: true };
  }
}
