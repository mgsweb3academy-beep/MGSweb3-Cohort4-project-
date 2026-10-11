// apps/api/src/modules/cohorts/cohorts.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type Actor = { id: string; role: string };

// Never include whole User rows here: they carry passwordHash and other private fields.
const publicUser = { select: { id: true, name: true, avatarUrl: true, githubUsername: true } };

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  // Programs
  async getPrograms() {
    return this.prisma.program.findMany({
      include: {
        cohorts: true,
        courses: { where: { status: 'published' } },
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

  // Students only see cohorts they belong to; instructors and admins see all.
  private cohortScope(user: Actor) {
    return user.role === 'student' ? { members: { some: { userId: user.id } } } : {};
  }

  // Cohorts
  async getCohorts(user: Actor) {
    return this.prisma.cohort.findMany({
      where: this.cohortScope(user),
      include: {
        program: true,
        members: { include: { user: publicUser } },
        teams: { include: { members: { include: { user: publicUser } } } },
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
  async getTeamsByCohort(cohortId: string, user: Actor) {
    const cohort = await this.prisma.cohort.findFirst({
      where: { id: cohortId, ...this.cohortScope(user) },
    });
    if (!cohort) throw new NotFoundException({ error: { code: 'COHORT_NOT_FOUND', message: 'Cohort not found' } });

    return this.prisma.team.findMany({
      where: { cohortId },
      include: {
        members: { include: { user: publicUser } },
        tasks: true,
      },
    });
  }

  async createTeam(cohortId: string, data: { name: string; memberUserIds: string[] }, user: Actor) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw new NotFoundException({ error: { code: 'COHORT_NOT_FOUND', message: 'Cohort not found' } });
    if (user.role !== 'admin' && cohort.instructorId !== user.id) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'You do not instruct this cohort' } });
    }

    const team = await this.prisma.team.create({
      data: {
        name: data.name,
        cohortId,
        members: {
          create: (data.memberUserIds || []).map((userId) => ({ userId })),
        },
      },
      include: {
        members: { include: { user: publicUser } },
      },
    });
    return team;
  }
}
