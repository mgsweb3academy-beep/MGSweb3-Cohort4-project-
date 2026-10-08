// apps/api/src/modules/health/health.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  imports: [HttpModule],
  providers: [HealthService],
  controllers: [HealthController],
  exports: [HealthService],
})
export class HealthModule {}
