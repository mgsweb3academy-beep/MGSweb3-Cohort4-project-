import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';
import { ProgramsModule } from './programs/programs.module';
import { CohortsModule } from './cohorts/cohorts.module';

@Module({
  imports: [CoursesModule, LessonsModule, ProgressModule, ProgramsModule, CohortsModule],
})
export class AppModule {}

