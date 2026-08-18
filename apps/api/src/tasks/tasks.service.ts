import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, TaskReview } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        reviews: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { reviews: true },
    });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async create(data: Partial<Task>) {
    return this.prisma.task.create({
      data: data as any,
    });
  }

  async update(id: string, data: Partial<Task>) {
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async getReviews(taskId: string) {
    return this.prisma.taskReview.findMany({
      where: { taskId },
    });
  }

  async addReview(taskId: string, reviewerId: string, status: string, comment?: string) {
    const review = await this.prisma.taskReview.create({
      data: {
        taskId,
        reviewerId,
        status,
        comment,
      },
    });
    return review;
  }
}
