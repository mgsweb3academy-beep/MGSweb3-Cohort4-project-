// apps/api/src/modules/contributions/contributions.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('contributions')
@UseGuards(JwtAuthGuard)
export class ContributionsController {
  constructor(private contributionsService: ContributionsService) {}

  @Get()
  async getContributions(
    @CurrentUser() user: any,
    @Query('cohortId') cohortId?: string,
    @Query('learnerId') learnerId?: string,
  ) {
    return this.contributionsService.getContributions(user, cohortId, learnerId);
  }
}
