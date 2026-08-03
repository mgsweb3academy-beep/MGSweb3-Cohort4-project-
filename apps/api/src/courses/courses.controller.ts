import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from 'types';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() body: { title: string }): Course {
    return this.coursesService.create(body);
  }

  @Get()
  findAll(): Course[] {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Course {
    return this.coursesService.findOne(id);
  }

  @Post(':id/request-review')
  requestReview(@Param('id') id: string): Course {
    return this.coursesService.requestReview(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    this.coursesService.remove(id);
    return { success: true };
  }
}
