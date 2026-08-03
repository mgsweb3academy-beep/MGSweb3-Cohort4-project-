import { Controller, Get, Param, Put, Post, Body, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from 'types';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any): Promise<Notification[]> {
    // Mock user for now, in a real app would come from AuthGuard
    const userId = req.user?.id || 'mock-user-1';
    return this.notificationsService.getUserNotifications(userId);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any): Promise<Notification> {
    const userId = req.user?.id || 'mock-user-1';
    return this.notificationsService.markAsRead(id, userId);
  }
}
