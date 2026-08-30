// apps/api/src/modules/cohorts/cohorts.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CohortsController {
  constructor(private cohortsService: CohortsService) {}

  @Get('programs')
  async getPrograms() {
    return this.cohortsService.getPrograms();
  }

  @Post('programs')
  @Roles('admin')
  async createProgram(@Body() body: { name: string; description: string; weekCount?: number }) {
    return this.cohortsService.createProgram(body);
  }

  @Get('cohorts')
  async getCohorts() {
    return this.cohortsService.getCohorts();
  }

  @Post('cohorts')
  @Roles('admin')
  async createCohort(@Body() body: { name: string; programId: string; instructorId: string; startDate: string; weekCount?: number }) {
    return this.cohortsService.createCohort(body);
  }

  @Get('cohorts/:id/teams')
  async getTeams(@Param('id') cohortId: string) {
    return this.cohortsService.getTeamsByCohort(cohortId);
  }

  @Post('cohorts/:id/teams')
  @Roles('instructor', 'admin')
  async createTeam(@Param('id') cohortId: string, @Body() body: { name: string; memberUserIds: string[] }) {
    return this.cohortsService.createTeam(cohortId, body);
  }
}
