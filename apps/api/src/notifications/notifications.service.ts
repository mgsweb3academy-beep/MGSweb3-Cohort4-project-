import { Injectable, Logger } from '@nestjs/common';
import { Notification, NotificationTrigger } from 'types';
import { randomUUID } from 'crypto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notifications: Notification[] = []; // In-memory mock for now

  // Triggers: task_state_change, review_received, deadline_approaching, certificate_issued, announcement_posted
  async createNotification(
    userId: string,
    trigger: NotificationTrigger,
    title: string,
    message: string,
    link?: string,
  ): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId,
      trigger,
      title,
      message,
      isRead: false,
      link,
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(notification);

    // Trigger email delivery
    await this.sendEmailNotification(userId, trigger, title, message);

    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = this.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    return notification;
  }

  private async sendEmailNotification(
    userId: string,
    trigger: NotificationTrigger,
    title: string,
    message: string,
  ) {
    // Mocking Resend email delivery
    this.logger.log(`[Resend Email Mock] Sending email to User ${userId}`);
    this.logger.log(`Subject: ${title}`);
    this.logger.log(`Body: ${message}`);
  }
}
