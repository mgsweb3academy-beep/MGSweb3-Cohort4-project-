// apps/api/src/modules/webhooks/webhooks.controller.ts
import { Controller, Post, Headers, Body, Req, HttpCode, RawBodyRequest, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(200)
  async handleGithubWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Body() body: any,
  ) {
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || '';
    // GitHub signs the exact bytes it sent, so verify against the raw body rather than a re-serialised copy.
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(body));
    const isValid = this.webhooksService.verifySignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      throw new UnauthorizedException({ error: { code: 'INVALID_SIGNATURE', message: 'Invalid GitHub webhook signature' } });
    }

    return this.webhooksService.handleGithubEvent(event, body);
  }
}
