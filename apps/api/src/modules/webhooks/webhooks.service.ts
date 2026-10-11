// apps/api/src/modules/webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private prisma: PrismaService) {}

  verifySignature(payload: Buffer | string, signature: string, secret: string): boolean {
    if (!secret) {
      // Unsigned deliveries are only tolerated outside production, for local testing.
      return process.env.NODE_ENV !== 'production';
    }
    if (!signature) return false;

    const digest = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const expected = Buffer.from(digest);
    const received = Buffer.from(signature);
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  }

  async handleGithubEvent(eventType: string, payload: any) {
    this.logger.log(`Received GitHub webhook event: ${eventType}`);

    if (eventType === 'push') {
      await this.recordPush(payload);
    } else if (eventType === 'pull_request') {
      this.logger.log(`PR action: ${payload.action} on ${payload.pull_request?.html_url}`);
    }

    return { received: true, processedEvent: eventType };
  }

  // Branches are named `task-<taskId>`; a push there counts towards that task's contribution record.
  private async recordPush(payload: any) {
    const branch = String(payload.ref || '').replace('refs/heads/', '');
    if (!branch.startsWith('task-')) return;

    const gitUsername = payload.pusher?.name || payload.sender?.login;
    if (!gitUsername) return;

    const task = await this.prisma.task.findUnique({ where: { id: branch.slice('task-'.length) } });
    if (!task) {
      this.logger.warn(`Push to ${branch} ignored: no matching task`);
      return;
    }

    const user = await this.prisma.user.findFirst({ where: { githubUsername: gitUsername } });
    if (!user) return;

    const commitCount = payload.commits?.length || 1;
    const existing = await this.prisma.contribution.findFirst({
      where: { learnerId: user.id, taskId: task.id },
    });

    if (existing) {
      await this.prisma.contribution.update({
        where: { id: existing.id },
        data: { rawCommitCount: { increment: commitCount } },
      });
    } else {
      await this.prisma.contribution.create({
        data: {
          learnerId: user.id,
          taskId: task.id,
          cohortId: task.cohortId,
          compositeScore: 10,
          rawCommitCount: commitCount,
          filesDistinct: 1,
          linesApproved: 0,
          reviewsGiven: 0,
          weekBreakdown: JSON.stringify([10]),
        },
      });
    }
  }
}
