import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Announcement } from 'types';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type Actor = { id: string; name: string; role: string };

@Injectable()
export class AnnouncementsService {
  // No Announcement model exists in the Prisma schema yet, so announcements are kept in memory
  // and are lost on restart. Notifications to recipients are persisted.
  private announcements: Announcement[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async createAnnouncement(
    author: Actor,
    title: string,
    content: string,
    courseId?: string,
    cohortId?: string,
  ): Promise<Announcement> {
    let recipientIds: string[] = [];

    if (cohortId) {
      const cohort = await this.prisma.cohort.findUnique({
        where: { id: cohortId },
        include: { members: true },
      });
      if (!cohort) throw new NotFoundException('Cohort not found');
      if (author.role !== 'admin' && cohort.instructorId !== author.id) {
        throw new ForbiddenException('You do not instruct this cohort');
      }
      recipientIds = cohort.members.map((m) => m.userId);
    }

    const announcement: Announcement = {
      id: randomUUID(),
      courseId,
      cohortId,
      authorId: author.id,
      authorName: author.name,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    this.announcements.push(announcement);

    if (recipientIds.length > 0) {
      await this.prisma.notification.createMany({
        data: recipientIds.map((userId) => ({
          userId,
          type: 'announcement_posted',
          title: `New Announcement: ${title}`,
          message: `By ${author.name}`,
          linkUrl: `/cohorts/${cohortId}/announcements`,
        })),
      });
    }

    return announcement;
  }

  async getAnnouncements(user: Actor, courseId?: string, cohortId?: string): Promise<Announcement[]> {
    // Students may only read announcements for cohorts they belong to.
    let allowedCohortIds: Set<string> | null = null;
    if (user.role === 'student') {
      const memberships = await this.prisma.cohortMember.findMany({ where: { userId: user.id } });
      allowedCohortIds = new Set(memberships.map((m) => m.cohortId));
    }

    return this.announcements
      .filter((a) => (courseId && a.courseId === courseId) || (cohortId && a.cohortId === cohortId))
      .filter((a) => !a.cohortId || !allowedCohortIds || allowedCohortIds.has(a.cohortId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
