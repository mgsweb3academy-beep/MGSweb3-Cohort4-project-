import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(200)
  async handleGithubWebhook(
    @Headers('x-github-event') event: string,
    @Body() payload: any,
  ) {
    if (event === 'push') {
      return this.webhooksService.handlePush(payload);
    } else if (event === 'pull_request') {
      return this.webhooksService.handlePullRequest(payload);
    }
    
    return { success: true, message: 'Event ignored' };
  }
}
