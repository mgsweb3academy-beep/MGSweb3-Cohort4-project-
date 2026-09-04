import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { prisma } from 'db';
import { ProgramsService } from '../programs/programs.service';

@Injectable()
export class CohortsService {
  constructor(
    @Inject(ProgramsService)
    private readonly programsService: ProgramsService
  ) {}

  private computeCurrentWeek(startDateStr: Date, weekCount: number): number {
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

  async findAll() {
    const cohorts = await prisma.cohort.findMany({
      include: {
        program: true,
        enrollments: true,
        teams: true,
      },
    });
    return cohorts.map((c) => ({
      ...c,
      currentWeek: this.computeCurrentWeek(c.startDate, c.weekCount),
    }));
  }

  async findOne(id: string) {
    const cohort = await prisma.cohort.findUnique({
      where: { id },
      include: {
        program: true,
        enrollments: true,
        teams: true,
      },
    });
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
    const program = await this.programsService.findOne(data.programId);
    // Hardcoding weekCount if omitted for simplicity, normally we'd pull from program
    const finalWeekCount = data.weekCount ? Number(data.weekCount) : 8;

    const newCohort = await prisma.cohort.create({
      data: {
        name: data.name || `${program.name} — Cohort`,
        programId: program.id,
        startDate: new Date(data.startDate),
        weekCount: finalWeekCount,
      }
    });

    return {
      ...newCohort,
      currentWeek: this.computeCurrentWeek(newCohort.startDate, newCohort.weekCount),
    };
  }

  async update(id: string, data: any) {
    try {
      const cohort = await prisma.cohort.update({
        where: { id },
        data: {
          name: data.name,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          weekCount: data.weekCount ? Number(data.weekCount) : undefined,
        },
      });
      return {
        ...cohort,
        currentWeek: this.computeCurrentWeek(cohort.startDate, cohort.weekCount),
      };
    } catch (e) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
  }

  // --- Roster Management ---

  async getRoster(cohortId: string) {
    return prisma.enrollment.findMany({
      where: { cohortId },
      include: { user: true, team: true }
    });
  }

  async addLearnerToRoster(cohortId: string, data: { userId: string }) {
    try {
      return await prisma.enrollment.create({
        data: {
          cohortId,
          userId: data.userId,
        }
      });
    } catch(e) {
      throw new BadRequestException('Learner is already active in this cohort roster');
    }
  }

  async softRemoveLearner(cohortId: string, userId: string) {
    // In Prisma, we could just delete the enrollment or mark it inactive.
    // For now we'll delete it.
    try {
      return await prisma.enrollment.delete({
        where: { userId_cohortId: { userId, cohortId } }
      });
    } catch (e) {
      throw new NotFoundException(`Roster member not found for user ${userId} in cohort ${cohortId}`);
    }
  }

  // --- Team Management ---

  async getTeams(cohortId: string) {
    return prisma.team.findMany({
      where: { cohortId },
      include: { enrollments: { include: { user: true } } }
    });
  }

  async createTeam(cohortId: string, data: { name: string }) {
    return prisma.team.create({
      data: {
        cohortId,
        name: data.name,
      }
    });
  }

  async updateTeam(cohortId: string, teamId: string, data: { name?: string }) {
    try {
      return await prisma.team.update({
        where: { id: teamId, cohortId },
        data: { name: data.name }
      });
    } catch(e) {
      throw new NotFoundException(`Team ${teamId} not found in cohort ${cohortId}`);
    }
  }

  async deleteTeam(cohortId: string, teamId: string) {
    try {
      await prisma.team.delete({
        where: { id: teamId, cohortId }
      });
      return { success: true };
    } catch (e) {
      throw new NotFoundException(`Team ${teamId} not found in cohort ${cohortId}`);
    }
  }
}
