import { Controller, Get, Param, Query, Post, Put, Body } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Lesson } from 'types';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll(@Query('courseId') courseId?: string): Lesson[] {
    if (courseId) {
      return this.lessonsService.findByCourseId(courseId);
    }
    return []; // For simplicity, only returning by courseId
  }

  @Get(':id')
  findOne(@Param('id') id: string): Lesson {
    return this.lessonsService.findOne(id);
  }

  @Post()
  create(@Body() body: Omit<Lesson, 'id'>): Lesson {
    return this.lessonsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Lesson>): Lesson {
    return this.lessonsService.update(id, body);
  }
}
