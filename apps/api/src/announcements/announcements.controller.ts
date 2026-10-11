import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from 'types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async getAnnouncements(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
    @Query('cohortId') cohortId?: string,
  ): Promise<Announcement[]> {
    return this.announcementsService.getAnnouncements(user, courseId, cohortId);
  }

  @Post()
  @Roles('instructor', 'admin')
  async createAnnouncement(
    @CurrentUser() user: any,
    @Body() body: { title: string; content: string; courseId?: string; cohortId?: string },
  ): Promise<Announcement> {
    return this.announcementsService.createAnnouncement(
      user,
      body.title,
      body.content,
      body.courseId,
      body.cohortId,
    );
  }
}
