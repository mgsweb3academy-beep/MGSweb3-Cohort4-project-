// apps/api/src/modules/webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  verifySignature(payload: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return true; // Skip in local dev if secret unset
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  async handleGithubEvent(eventType: string, payload: any) {
    this.logger.log(`Received GitHub webhook event: ${eventType}`);

    if (eventType === 'push') {
      const gitUsername = payload.pusher?.name || payload.sender?.login;
      if (gitUsername) {
        const user = await this.prisma.user.findFirst({
          where: { githubUsername: gitUsername },
        });

        if (user) {
          // Increment or record contribution snapshot
          await this.prisma.contribution.create({
            data: {
              learnerId: user.id,
              taskId: 'default_task',
              cohortId: 'default_cohort',
              compositeScore: 10,
              rawCommitCount: payload.commits?.length || 1,
              filesDistinct: 1,
              linesApproved: 10,
              reviewsGiven: 0,
              weekBreakdown: JSON.stringify([10]),
            },
          });
        }
      }
    } else if (eventType === 'pull_request') {
      this.logger.log(`PR action: ${payload.action} on ${payload.pull_request?.html_url}`);
    }

    return { received: true, processedEvent: eventType };
  }
}
