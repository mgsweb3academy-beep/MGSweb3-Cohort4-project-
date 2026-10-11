// apps/api/src/modules/tasks/tasks.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskState } from 'types';

type Actor = { id: string; role: string };

// The API speaks 'In Review'; the Prisma enum can't contain a space, so it stores 'InReview'.
const toDbState = (state: string) => (state === 'In Review' ? 'InReview' : state);
const toApiState = (state: string) => (state === 'InReview' ? 'In Review' : state) as TaskState;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  private toDto(t: any) {
    return {
      id: t.id,
      title: t.title,
      teamId: t.teamId,
      teamName: t.team?.name || '',
      cohortId: t.cohortId,
      state: toApiState(t.state),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      closedAt: t.closedAt?.toISOString(),
    };
  }

  // Students only see tasks belonging to teams they are a member of.
  private scopeFor(user: Actor) {
    return user.role === 'student' ? { team: { members: { some: { userId: user.id } } } } : {};
  }

  private async assertCanManageCohort(cohortId: string, user: Actor) {
    if (user.role === 'admin') return;
    const cohort = await this.prisma.cohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw new NotFoundException({ error: { code: 'COHORT_NOT_FOUND', message: 'Cohort not found' } });
    if (cohort.instructorId !== user.id) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'You do not instruct this cohort' } });
    }
  }

  async getTasks(user: Actor, query?: { cohortId?: string; teamId?: string; state?: TaskState }) {
    const where: any = { ...this.scopeFor(user) };
    if (query?.cohortId) where.cohortId = query.cohortId;
    if (query?.teamId) where.teamId = query.teamId;
    if (query?.state) where.state = toDbState(query.state);

    const tasks = await this.prisma.task.findMany({
      where,
      include: { team: true, cohort: true },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => this.toDto(t));
  }

  async getTaskById(id: string, user: Actor) {
    const t = await this.prisma.task.findFirst({
      where: { id, ...this.scopeFor(user) },
      include: { team: true, cohort: true },
    });
    if (!t) throw new NotFoundException({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });

    return this.toDto(t);
  }

  async createTask(data: { title: string; teamId: string; cohortId: string }, user: Actor) {
    await this.assertCanManageCohort(data.cohortId, user);

    const team = await this.prisma.team.findUnique({ where: { id: data.teamId } });
    if (!team || team.cohortId !== data.cohortId) {
      throw new BadRequestException({ error: { code: 'TEAM_COHORT_MISMATCH', message: 'Team does not belong to the cohort' } });
    }

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        teamId: data.teamId,
        cohortId: data.cohortId,
        state: 'Assigned',
      },
      include: { team: true, cohort: true },
    });

    return this.toDto(task);
  }

  async updateTaskState(id: string, newState: TaskState, user: Actor) {
    const allowedTransitions: Record<string, string[]> = {
      Assigned: ['Branched'],
      Branched: ['Pushed'],
      Pushed: ['In Review', 'Branched'],
      'In Review': ['Closed', 'Pushed'],
      Closed: [],
    };

    const task = await this.prisma.task.findFirst({
      where: { id, ...this.scopeFor(user) },
    });
    if (!task) throw new NotFoundException({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });

    // Closing a task is the review outcome, so it is reserved for the cohort's instructor or an admin.
    if (newState === 'Closed') {
      await this.assertCanManageCohort(task.cohortId, user);
    }

    const currentState = toApiState(task.state);
    const validNextStates = allowedTransitions[currentState] || [];

    if (!validNextStates.includes(newState)) {
      throw new BadRequestException({
        error: {
          code: 'STATE_TRANSITION_INVALID',
          message: `Cannot transition task from state '${currentState}' to '${newState}'. Allowed transitions: ${validNextStates.join(', ')}`,
        },
      });
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        state: toDbState(newState) as any,
        closedAt: newState === 'Closed' ? new Date() : undefined,
      },
      include: { team: true, cohort: true },
    });

    return this.toDto(updated);
  }
}
