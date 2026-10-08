import { Module } from '@nestjs/common';
import { AiManagerController } from './ai-manager.controller';
import { AiManagerService } from './ai-manager.service';

@Module({
  controllers: [AiManagerController],
  providers: [AiManagerService],
})
export class AiManagerModule {}
