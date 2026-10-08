import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from 'types';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body() body: { title: string }): Promise<Course> {
    return this.coursesService.create(body);
  }

  @Get()
  async findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  @Post(':id/request-review')
  async requestReview(@Param('id') id: string): Promise<Course> {
    return this.coursesService.requestReview(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.coursesService.remove(id);
    return { success: true };
  }
}
