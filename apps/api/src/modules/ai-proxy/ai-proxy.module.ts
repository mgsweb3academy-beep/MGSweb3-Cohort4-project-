// apps/api/src/modules/ai-proxy/ai-proxy.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiProxyService } from './ai-proxy.service';
import { AiProxyController } from './ai-proxy.controller';

@Module({
  imports: [HttpModule],
  providers: [AiProxyService],
  controllers: [AiProxyController],
  exports: [AiProxyService],
})
export class AiProxyModule {}
