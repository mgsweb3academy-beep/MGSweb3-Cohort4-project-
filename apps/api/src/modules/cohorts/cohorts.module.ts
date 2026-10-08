// apps/api/src/modules/cohorts/cohorts.module.ts
import { Module } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CohortsController } from './cohorts.controller';

@Module({
  providers: [CohortsService],
  controllers: [CohortsController],
  exports: [CohortsService],
})
export class CohortsModule {}
