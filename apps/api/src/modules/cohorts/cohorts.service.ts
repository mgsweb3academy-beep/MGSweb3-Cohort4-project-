// apps/api/src/modules/cohorts/cohorts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  // Programs
  async getPrograms() {
    return this.prisma.program.findMany({
      include: {
        cohorts: true,
        courses: true,
      },
    });
  }

  async createProgram(data: { name: string; description: string; weekCount?: number }) {
    return this.prisma.program.create({
      data: {
        name: data.name,
        description: data.description,
        weekCount: data.weekCount || 8,
      },
    });
  }

  // Cohorts
  async getCohorts() {
    return this.prisma.cohort.findMany({
      include: {
        program: true,
        members: { include: { user: true } },
        teams: { include: { members: { include: { user: true } } } },
      },
    });
  }

  async createCohort(data: { name: string; programId: string; instructorId: string; startDate: string; weekCount?: number }) {
    return this.prisma.cohort.create({
      data: {
        name: data.name,
        programId: data.programId,
        instructorId: data.instructorId,
        startDate: new Date(data.startDate),
        weekCount: data.weekCount || 8,
      },
    });
  }

  // Teams
  async getTeamsByCohort(cohortId: string) {
    return this.prisma.team.findMany({
      where: { cohortId },
      include: {
        members: { include: { user: true } },
        tasks: true,
      },
    });
  }

  async createTeam(cohortId: string, data: { name: string; memberUserIds: string[] }) {
    const team = await this.prisma.team.create({
      data: {
        name: data.name,
        cohortId,
        members: {
          create: (data.memberUserIds || []).map((userId) => ({ userId })),
        },
      },
      include: {
        members: { include: { user: true } },
      },
    });
    return team;
  }
}
