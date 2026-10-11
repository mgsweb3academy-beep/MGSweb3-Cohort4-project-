// apps/api/src/modules/ai-proxy/ai-proxy.service.ts
import { Injectable, Logger, NotImplementedException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

const AI_UNAVAILABLE = {
  error: {
    code: 'AI_SERVICE_DEGRADED',
    message: 'AI Service is currently offline or unreachable. LMS core features remain functional.',
  },
};

@Injectable()
export class AiProxyService {
  private readonly logger = new Logger(AiProxyService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {}

  // Failures are surfaced as 503 rather than a canned answer, so callers never mistake an outage for an AI reply.
  async askTutor(question: string, lessonId?: string, userId?: string) {
    // Ground the tutor in published lesson text only; drafts must not leak through the AI.
    const lesson = lessonId
      ? await this.prisma.lesson.findFirst({ where: { id: lessonId, course: { status: 'published' } } })
      : null;

    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.aiServiceUrl}/v1/tutor/ask`, {
            agentId: 'tutor',
            action: 'ask',
            payload: { question, lessonId, userId, lessonContext: lesson?.textContent ?? '' },
          })
          .pipe(timeout(30000)),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`AI tutor request failed: ${error.message}`);
      throw new ServiceUnavailableException(AI_UNAVAILABLE);
    }
  }

  // The AI service has no code-review agent yet; say so instead of pretending a review was queued.
  async triggerCodeReview(taskId: string, pullRequestUrl?: string) {
    this.logger.warn(`Code review requested for task ${taskId} but no review agent is available`);
    throw new NotImplementedException({
      error: { code: 'AI_REVIEW_NOT_AVAILABLE', message: 'AI code review is not available yet' },
    });
  }
}
