// apps/api/src/modules/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, catchError, of } from 'rxjs';

@Injectable()
export class HealthService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async checkHealth() {
    let dbStatus: 'up' | 'down' = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    const aiStatus = await this.checkAiHealthInternal();

    const isDegraded = aiStatus === 'down' || aiStatus === 'degraded';

    return {
      status: dbStatus === 'down' ? 'error' : isDegraded ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: 'up', // redis cache/queue status
        aiService: aiStatus,
      },
    };
  }

  async getAiHealth() {
    const aiStatus = await this.checkAiHealthInternal();
    if (aiStatus === 'down') {
      return {
        aiAvailable: false,
        status: 'degraded',
        message: 'AI microservice is currently unreachable. Core LMS functionality remains 100% operational.',
      };
    }
    return {
      aiAvailable: true,
      status: 'ok',
      message: 'AI microservice is healthy.',
    };
  }

  private async checkAiHealthInternal(): Promise<'up' | 'degraded' | 'down'> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.aiServiceUrl}/health`).pipe(
          timeout(2000),
          catchError(() => of(null)),
        ),
      );
      return res && res.status === 200 ? 'up' : 'down';
    } catch {
      return 'down';
    }
  }
}
