// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CohortsModule } from './modules/cohorts/cohorts.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { AiProxyModule } from './modules/ai-proxy/ai-proxy.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DiscussionsModule } from './modules/discussions/discussions.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CohortsModule,
    CoursesModule,
    TasksModule,
    WebhooksModule,
    ContributionsModule,
    AiProxyModule,
    AdminModule,
    NotificationsModule,
    DiscussionsModule,
    HealthModule,
  ],
})
export class AppModule {}
