import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import { AiManagerService } from './ai-manager.service';

@Controller('ai-manager')
export class AiManagerController {
  constructor(private readonly aiManagerService: AiManagerService) {}

  @Get('config/:id')
  async getConfig(@Param('id') id: string) {
    return this.aiManagerService.getConfig(id);
  }

  @Put('config/:id')
  async updateConfig(@Param('id') id: string, @Body() body: any) {
    return this.aiManagerService.updateConfig(id, body);
  }

  @Get('logs')
  async getLogs() {
    return this.aiManagerService.getLogs();
  }

  @Post('logs')
  async logAction(@Body() body: any) {
    return this.aiManagerService.logAction(
      body.agentId,
      body.action,
      body.status,
      body.cohortId,
      body.teamId,
      body.taskId
    );
  }
}
