// apps/api/src/modules/webhooks/webhooks.controller.ts
import { Controller, Post, Headers, Body, UnauthorizedException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('github')
  async handleGithubWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: any,
  ) {
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || '';
    const isValid = this.webhooksService.verifySignature(JSON.stringify(body), signature, webhookSecret);

    if (!isValid) {
      throw new UnauthorizedException({ error: { code: 'INVALID_SIGNATURE', message: 'Invalid GitHub webhook signature' } });
    }

    return this.webhooksService.handleGithubEvent(event, body);
  }
}
