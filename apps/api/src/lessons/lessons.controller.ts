import { Controller, Get, Param, Query, Post, Put, Body } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Lesson } from 'types';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(@Query('courseId') courseId?: string): Promise<Lesson[]> {
    if (courseId) {
      return this.lessonsService.findByCourseId(courseId);
    }
    return []; // For simplicity, only returning by courseId
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Lesson> {
    return this.lessonsService.findOne(id);
  }

  @Post()
  async create(@Body() body: Omit<Lesson, 'id'>): Promise<Lesson> {
    return this.lessonsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Lesson>): Promise<Lesson> {
    return this.lessonsService.update(id, body);
  }
}
