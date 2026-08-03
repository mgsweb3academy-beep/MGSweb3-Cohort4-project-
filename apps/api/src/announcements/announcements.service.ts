import { Injectable } from '@nestjs/common';
import { Announcement } from 'types';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  private announcements: Announcement[] = [];

  constructor(private readonly notificationsService: NotificationsService) {}

  async createAnnouncement(
    authorId: string,
    authorName: string,
    title: string,
    content: string,
    courseId?: string,
    cohortId?: string
  ): Promise<Announcement> {
    const announcement: Announcement = {
      id: randomUUID(),
      courseId,
      cohortId,
      authorId,
      authorName,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    this.announcements.push(announcement);

    // In a real app, we would fetch all users enrolled in the course/cohort
    // and trigger notifications for them. Mocking with a single notification for now.
    await this.notificationsService.createNotification(
      'mock-student-1',
      'announcement_posted',
      `New Announcement: ${title}`,
      `By ${authorName}`,
      `/cohorts/${cohortId}/announcements`
    );

    return announcement;
  }

  async getAnnouncements(courseId?: string, cohortId?: string): Promise<Announcement[]> {
    return this.announcements
      .filter((a) => (courseId && a.courseId === courseId) || (cohortId && a.cohortId === cohortId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
