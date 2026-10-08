import { Controller, Post, Headers, Body, Get, Param, BadRequestException, HttpCode } from '@nestjs/common';
import { GitService } from './git.service';
import * as crypto from 'crypto';

@Controller('api/v1')
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Post('webhooks/github')
  @HttpCode(202)
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: any,
  ) {
    if (!event) {
      throw new BadRequestException('Missing x-github-event header');
    }

    // Optional: Validate signature here in production
    // this.verifySignature(signature, JSON.stringify(payload));

    // Process asynchronously (queueing mock)
    this.gitService.processWebhookPayload(event, payload).catch(err => {
      // Errors are caught and logged in the service. In a real queue, this would retry.
      console.error('Webhook processing failed in background', err);
    });

    return { status: 'accepted' };
  }

  @Get('cohorts/:cohortId/contributions')
  getContributions(@Param('cohortId') cohortId: string) {
    return this.gitService.getContributionsForCohort(cohortId);
  }

  private verifySignature(signature: string, payload: string) {
    const secret = process.env.GITHUB_WEBHOOK_SECRET || 'dummy-secret';
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    if (signature !== digest) {
      throw new BadRequestException('Invalid signature');
    }
  }
}
