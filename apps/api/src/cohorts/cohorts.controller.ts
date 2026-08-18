import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { Cohort, Team, RosterMember } from 'types';

@Controller('cohorts')
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Get()
  async findAll() {
    return this.cohortsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    body: {
      name: string;
      programId: string;
      startDate: string;
      weekCount?: number;
      instructorId?: string;
      instructorName?: string;
    }
  ) {
    return this.cohortsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Cohort>) {
    return this.cohortsService.update(id, body);
  }

  // --- Roster endpoints ---

  @Get(':id/roster')
  async getRoster(@Param('id') id: string) {
    return this.cohortsService.getRoster(id);
  }

  @Post(':id/roster')
  async addLearner(
    @Param('id') id: string,
    @Body()
    body: {
      userId: string;
      userName: string;
      userEmail: string;
      githubUsername?: string;
    }
  ) {
    return this.cohortsService.addLearnerToRoster(id, body);
  }

  @Delete(':id/roster/:userId')
  async softRemoveLearner(
    @Param('id') cohortId: string,
    @Param('userId') userId: string
  ) {
    return this.cohortsService.softRemoveLearner(cohortId, userId);
  }

  // --- Team endpoints ---

  @Get(':id/teams')
  async getTeams(@Param('id') id: string) {
    return this.cohortsService.getTeams(id);
  }

  @Post(':id/teams')
  async createTeam(
    @Param('id') id: string,
    @Body() body: { name: string; memberIds?: string[]; memberNames?: string[] }
  ) {
    return this.cohortsService.createTeam(id, body);
  }

  @Put(':id/teams/:teamId')
  async updateTeam(
    @Param('id') cohortId: string,
    @Param('teamId') teamId: string,
    @Body() body: { name?: string; memberIds?: string[]; memberNames?: string[] }
  ) {
    return this.cohortsService.updateTeam(cohortId, teamId, body);
  }

  @Delete(':id/teams/:teamId')
  async deleteTeam(
    @Param('id') cohortId: string,
    @Param('teamId') teamId: string
  ) {
    return this.cohortsService.deleteTeam(cohortId, teamId);
  }
}
