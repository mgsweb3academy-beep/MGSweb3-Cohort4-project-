// apps/api/src/modules/discussions/discussions.module.ts
import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';

@Module({
  providers: [DiscussionsService],
  controllers: [DiscussionsController],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
