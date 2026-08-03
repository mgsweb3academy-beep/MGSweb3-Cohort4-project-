import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from 'types';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async getAnnouncements(
    @Query('courseId') courseId?: string,
    @Query('cohortId') cohortId?: string
  ): Promise<Announcement[]> {
    return this.announcementsService.getAnnouncements(courseId, cohortId);
  }

  @Post()
  async createAnnouncement(
    @Body() body: { title: string; content: string; courseId?: string; cohortId?: string },
    @Req() req: any
  ): Promise<Announcement> {
    const authorId = req.user?.id || 'mock-instructor-1';
    const authorName = req.user?.name || 'Mock Instructor';
    return this.announcementsService.createAnnouncement(
      authorId,
      authorName,
      body.title,
      body.content,
      body.courseId,
      body.cohortId
    );
  }
}
