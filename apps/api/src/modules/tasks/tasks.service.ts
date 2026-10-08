// apps/api/src/modules/tasks/tasks.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskState } from 'types';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getTasks(query?: { cohortId?: string; teamId?: string; state?: TaskState }) {
    const where: any = {};
    if (query?.cohortId) where.cohortId = query.cohortId;
    if (query?.teamId) where.teamId = query.teamId;
    if (query?.state) where.state = query.state;

    const tasks = await this.prisma.task.findMany({
      where,
      include: { team: true, cohort: true },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      teamId: t.teamId,
      teamName: t.team?.name || '',
      cohortId: t.cohortId,
      state: t.state as TaskState,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      closedAt: t.closedAt?.toISOString(),
    }));
  }

  async getTaskById(id: string) {
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { team: true, cohort: true },
    });
    if (!t) throw new NotFoundException({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });

    return {
      id: t.id,
      title: t.title,
      teamId: t.teamId,
      teamName: t.team?.name || '',
      cohortId: t.cohortId,
      state: t.state as TaskState,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      closedAt: t.closedAt?.toISOString(),
    };
  }

  async createTask(data: { title: string; teamId: string; cohortId: string }) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        teamId: data.teamId,
        cohortId: data.cohortId,
        state: 'Assigned',
      },
      include: { team: true, cohort: true },
    });

    return {
      id: task.id,
      title: task.title,
      teamId: task.teamId,
      teamName: task.team?.name || '',
      cohortId: task.cohortId,
      state: task.state as TaskState,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  async updateTaskState(id: string, newState: TaskState) {
    const allowedTransitions: Record<string, string[]> = {
      Assigned: ['Branched'],
      Branched: ['Pushed'],
      Pushed: ['In Review', 'Branched'],
      'In Review': ['Closed', 'Pushed'],
      Closed: [],
    };

    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException({ error: { code: 'TASK_NOT_FOUND', message: 'Task not found' } });

    const currentState = task.state;
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
        state: newState as any,
        closedAt: newState === 'Closed' ? new Date() : undefined,
      },
      include: { team: true, cohort: true },
    });

    return {
      id: updated.id,
      title: updated.title,
      teamId: updated.teamId,
      teamName: updated.team?.name || '',
      cohortId: updated.cohortId,
      state: updated.state as TaskState,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      closedAt: updated.closedAt?.toISOString(),
    };
  }
}
