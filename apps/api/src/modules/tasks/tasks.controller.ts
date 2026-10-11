// apps/api/src/modules/tasks/tasks.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TaskState } from 'types';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async getTasks(
    @CurrentUser() user: any,
    @Query('cohortId') cohortId?: string,
    @Query('teamId') teamId?: string,
    @Query('state') state?: TaskState,
  ) {
    return this.tasksService.getTasks(user, { cohortId, teamId, state });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  @Roles('instructor', 'admin')
  async createTask(@CurrentUser() user: any, @Body() body: { title: string; teamId: string; cohortId: string }) {
    return this.tasksService.createTask(body, user);
  }

  @Patch(':id/state')
  async updateTaskState(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { state: TaskState }) {
    return this.tasksService.updateTaskState(id, body.state, user);
  }
}
