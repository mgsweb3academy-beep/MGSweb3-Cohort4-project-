// apps/api/src/modules/tasks/tasks.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TaskState } from 'types';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query('cohortId') cohortId?: string,
    @Query('teamId') teamId?: string,
    @Query('state') state?: TaskState,
  ) {
    return this.tasksService.getTasks({ cohortId, teamId, state });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  @Roles('instructor', 'admin')
  async createTask(@Body() body: { title: string; teamId: string; cohortId: string }) {
    return this.tasksService.createTask(body);
  }

  @Patch(':id/state')
  async updateTaskState(@Param('id') id: string, @Body() body: { state: TaskState }) {
    return this.tasksService.updateTaskState(id, body.state);
  }
}
