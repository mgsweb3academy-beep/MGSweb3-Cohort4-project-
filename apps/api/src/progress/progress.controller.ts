import { Controller, Get, Param, Post, Put, Body, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { LessonProgress, Bookmark, Note } from 'types';

@Controller('lessons/:lessonId/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getProgress(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string
  ) {
    // In a real app, userId comes from the auth token
    const effectiveUserId = userId || 'default_user';
    return this.progressService.getProgress(lessonId, effectiveUserId);
  }

  @Put()
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body('lastPosition') lastPosition: number
  ) {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.updateProgress(lessonId, effectiveUserId, lastPosition);
  }

  @Post('bookmarks')
  async addBookmark(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body() body: { position: number; label: string }
  ) {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.addBookmark(lessonId, effectiveUserId, body.position, body.label);
  }

  @Post('notes')
  async addNote(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body() body: { position: number; content: string }
  ) {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.addNote(lessonId, effectiveUserId, body.position, body.content);
  }
}
