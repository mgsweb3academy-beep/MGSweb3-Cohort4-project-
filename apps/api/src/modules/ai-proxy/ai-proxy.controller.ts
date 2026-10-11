// apps/api/src/modules/ai-proxy/ai-proxy.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiProxyController {
  constructor(private aiProxyService: AiProxyService) {}

  @Post('tutor')
  async askTutor(@CurrentUser() user: any, @Body() body: { question: string; lessonId?: string }) {
    return this.aiProxyService.askTutor(body.question, body.lessonId, user.id);
  }

  @Post('review')
  @Roles('instructor', 'admin')
  async triggerReview(@Body() body: { taskId: string; pullRequestUrl?: string }) {
    return this.aiProxyService.triggerCodeReview(body.taskId, body.pullRequestUrl);
  }
}
