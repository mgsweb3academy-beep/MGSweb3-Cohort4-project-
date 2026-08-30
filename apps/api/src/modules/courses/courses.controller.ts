// apps/api/src/modules/courses/courses.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('courses')
  async getCourses() {
    return this.coursesService.getCourses();
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @Post('courses')
  @Roles('instructor', 'admin')
  async createCourse(@CurrentUser() user: any, @Body() body: { title: string; programId: string }) {
    return this.coursesService.createCourse(user.id, body);
  }

  @Post('courses/:id/request-review')
  @Roles('instructor')
  async requestReview(@Param('id') id: string) {
    return this.coursesService.requestReview(id);
  }

  @Post('courses/:id/approve')
  @Roles('admin')
  async approveCourse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.approveCourse(id, user.id);
  }

  @Post('courses/:id/reject')
  @Roles('admin')
  async rejectCourse(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { rejectionReason: string }) {
    return this.coursesService.rejectCourse(id, user.id, body.rejectionReason);
  }

  @Get('lessons/:id')
  async getLessonById(@Param('id') id: string) {
    return this.coursesService.getLessonById(id);
  }

  @Post('lessons')
  @Roles('instructor', 'admin')
  async createLesson(@Body() body: { courseId: string; title: string; contentType: any; contentUrl?: string; textContent?: string; order?: number }) {
    return this.coursesService.createLesson(body);
  }

  @Put('lessons/:id')
  @Roles('instructor', 'admin')
  async updateLesson(@Param('id') id: string, @Body() body: { title?: string; textContent?: string; contentUrl?: string }) {
    return this.coursesService.updateLesson(id, body);
  }

  @Get('lessons/:id/progress')
  async getLessonProgress(@Param('id') lessonId: string, @CurrentUser() user: any) {
    return this.coursesService.getLessonProgress(lessonId, user.id);
  }

  @Put('lessons/:id/progress')
  async updateLessonProgress(@Param('id') lessonId: string, @CurrentUser() user: any, @Body() body: { lastPosition?: number; isCompleted?: boolean }) {
    return this.coursesService.updateLessonProgress(lessonId, user.id, body);
  }

  @Post('lessons/:id/bookmarks')
  async addBookmark(@Param('id') lessonId: string, @CurrentUser() user: any, @Body() body: { position: number; label: string }) {
    return this.coursesService.addBookmark(lessonId, user.id, body);
  }

  @Post('lessons/:id/notes')
  async addNote(@Param('id') lessonId: string, @CurrentUser() user: any, @Body() body: { position: number; content: string }) {
    return this.coursesService.addNote(lessonId, user.id, body);
  }
}
