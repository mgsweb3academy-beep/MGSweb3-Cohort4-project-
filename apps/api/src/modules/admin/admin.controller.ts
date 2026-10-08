// apps/api/src/modules/admin/admin.controller.ts
import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/suspend')
  async suspendUser(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { reason: string }) {
    return this.adminService.suspendUser(id, user.id, body.reason);
  }

  @Patch('users/:id/reinstate')
  async reinstateUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.reinstateUser(id, user.id);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getPlatformAnalytics();
  }

  @Get('agent-config')
  async getAgentConfigs() {
    return this.adminService.getAgentConfigs();
  }

  @Patch('agent-config/:agentId')
  async updateAgentConfig(
    @Param('agentId') agentId: string,
    @CurrentUser() user: any,
    @Body() body: { enabled?: boolean; autonomyLevel?: any },
  ) {
    return this.adminService.updateAgentConfig(agentId, user.id, body);
  }

  @Get('moderation')
  async getModerationItems() {
    return this.adminService.getModerationItems();
  }

  @Post('moderation/:id/action')
  async resolveModeration(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { action: any }) {
    return this.adminService.resolveModerationItem(id, user.id, body.action);
  }
}
