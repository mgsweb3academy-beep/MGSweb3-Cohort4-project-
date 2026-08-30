// apps/api/src/modules/ai-proxy/ai-proxy.service.ts
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class AiProxyService {
  private readonly logger = new Logger(AiProxyService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(private httpService: HttpService) {}

  async askTutor(question: string, lessonId?: string, userId?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/tutor`, { question, lessonId, userId }).pipe(
          timeout(3000),
          catchError((err) => {
            this.logger.warn(`AI Service timeout or error: ${err.message}`);
            return of({
              data: {
                answer: 'The AI Tutor is temporarily unavailable due to a service outage. Core LMS learning materials, courses, and task boards remain fully accessible.',
                confidenceDisclaimer: 'System Fallback Response (AI Service Degraded)',
                aiAvailable: false,
              },
            });
          }),
        ),
      );
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException({
        error: {
          code: 'AI_SERVICE_DEGRADED',
          message: 'AI Service is currently offline or unreachable. LMS core features remain functional.',
        },
      });
    }
  }

  async triggerCodeReview(taskId: string, pullRequestUrl?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/api/v1/review`, { taskId, pullRequestUrl }).pipe(
          timeout(4000),
          catchError((err) => {
            this.logger.warn(`AI Review Service timeout or error: ${err.message}`);
            return of({
              data: {
                feedback: 'AI Code Review queued. Peer review and instructor review processes remain active.',
                suggestedState: 'In Review',
                aiAvailable: false,
              },
            });
          }),
        ),
      );
      return response.data;
    } catch (error) {
      return {
        feedback: 'AI Code Review service degraded. Task will be processed once AI service recovers.',
        suggestedState: 'In Review',
        aiAvailable: false,
      };
    }
  }
}
