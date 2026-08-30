// apps/api/src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type as any,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      linkUrl: n.linkUrl || undefined,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }
}
