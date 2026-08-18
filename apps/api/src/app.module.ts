import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { ProgramsModule } from './programs/programs.module';
import { CohortsModule } from './cohorts/cohorts.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AiManagerModule } from './ai-manager/ai-manager.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TasksModule,
    CoursesModule,
    LessonsModule,
    ProgressModule,
    ProgramsModule,
    CohortsModule,
    AdminModule,
    NotificationsModule,
    DiscussionsModule,
    AnnouncementsModule,
    AiManagerModule,
  ],
})
export class AppModule {}
