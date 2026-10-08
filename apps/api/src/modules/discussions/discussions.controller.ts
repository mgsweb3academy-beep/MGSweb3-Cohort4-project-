// apps/api/src/modules/discussions/discussions.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get()
  async getDiscussions(
    @Query('courseId') courseId?: string,
    @Query('cohortId') cohortId?: string,
  ) {
    return this.discussionsService.getDiscussions(courseId, cohortId);
  }

  @Post()
  async createPost(
    @CurrentUser() user: any,
    @Body() body: { title: string; content: string; courseId?: string; cohortId?: string },
  ) {
    return this.discussionsService.createPost(user.id, body);
  }

  @Post(':id/flag')
  async flagPost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reason: string },
  ) {
    return this.discussionsService.flagPost(id, user.id, body.reason);
  }
}
