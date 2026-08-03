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
  ],
})
export class AppModule {}

