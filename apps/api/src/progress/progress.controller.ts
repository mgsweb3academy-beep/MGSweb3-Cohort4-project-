import { Controller, Get, Param, Post, Put, Body, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { LessonProgress, Bookmark, Note } from 'types';

@Controller('lessons/:lessonId/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getProgress(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string
  ): LessonProgress {
    // In a real app, userId comes from the auth token
    const effectiveUserId = userId || 'default_user';
    return this.progressService.getProgress(lessonId, effectiveUserId);
  }

  @Put()
  updateProgress(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body('lastPosition') lastPosition: number
  ): LessonProgress {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.updateProgress(lessonId, effectiveUserId, lastPosition);
  }

  @Post('bookmarks')
  addBookmark(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body() body: { position: number; label: string }
  ): Bookmark {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.addBookmark(lessonId, effectiveUserId, body.position, body.label);
  }

  @Post('notes')
  addNote(
    @Param('lessonId') lessonId: string,
    @Query('userId') userId: string,
    @Body() body: { position: number; content: string }
  ): Note {
    const effectiveUserId = userId || 'default_user';
    return this.progressService.addNote(lessonId, effectiveUserId, body.position, body.content);
  }
}
