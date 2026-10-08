import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('tutor/ask')
  async askTutor(@Body() body: { lessonId: string; question: string }) {
    return this.aiService.triggerTutorAction(body.lessonId, body.question);
  }
}
