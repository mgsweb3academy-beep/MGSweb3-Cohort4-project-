import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string) {
    return this.tasksService.getReviews(id);
  }

  @Post(':id/reviews')
  async addReview(@Param('id') id: string, @Body() body: { reviewerId: string; status: string; comment?: string }) {
    return this.tasksService.addReview(id, body.reviewerId, body.status, body.comment);
  }
}
