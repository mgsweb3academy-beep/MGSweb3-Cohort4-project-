// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
<<<<<<< HEAD
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
=======
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { ProgramsModule } from './programs/programs.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    CoursesModule,
    LessonsModule,
    ProgressModule,
    ProgramsModule,
    CohortsModule,
    AdminModule,
    NotificationsModule,
    DiscussionsModule,
    AnnouncementsModule,
>>>>>>> 00c2225b76a44cd4ef72db9ab3094238ce38050c
  ],
})
export class AppModule {}

