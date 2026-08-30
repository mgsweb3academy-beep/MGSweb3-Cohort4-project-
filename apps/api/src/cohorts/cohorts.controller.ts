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
  findAll(): Cohort[] {
    return this.cohortsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Cohort {
    return this.cohortsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      programId: string;
      startDate: string;
      weekCount?: number;
      instructorId?: string;
      instructorName?: string;
    }
  ): Cohort {
    return this.cohortsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Cohort>): Cohort {
    return this.cohortsService.update(id, body);
  }

  // --- Roster endpoints ---

  @Get(':id/roster')
  getRoster(@Param('id') id: string): RosterMember[] {
    return this.cohortsService.getRoster(id);
  }

  @Post(':id/roster')
  addLearner(
    @Param('id') id: string,
    @Body()
    body: {
      userId: string;
      userName: string;
      userEmail: string;
      githubUsername?: string;
    }
  ): RosterMember {
    return this.cohortsService.addLearnerToRoster(id, body);
  }

  @Delete(':id/roster/:userId')
  softRemoveLearner(
    @Param('id') cohortId: string,
    @Param('userId') userId: string
  ): RosterMember {
    return this.cohortsService.softRemoveLearner(cohortId, userId);
  }

  // --- Team endpoints ---

  @Get(':id/teams')
  getTeams(@Param('id') id: string): Team[] {
    return this.cohortsService.getTeams(id);
  }

  @Post(':id/teams')
  createTeam(
    @Param('id') id: string,
    @Body() body: { name: string; memberIds?: string[]; memberNames?: string[] }
  ): Team {
    return this.cohortsService.createTeam(id, body);
  }

  @Put(':id/teams/:teamId')
  updateTeam(
    @Param('id') cohortId: string,
    @Param('teamId') teamId: string,
    @Body() body: { name?: string; memberIds?: string[]; memberNames?: string[] }
  ): Team {
    return this.cohortsService.updateTeam(cohortId, teamId, body);
  }

  @Delete(':id/teams/:teamId')
  deleteTeam(
    @Param('id') cohortId: string,
    @Param('teamId') teamId: string
  ): { success: boolean } {
    return this.cohortsService.deleteTeam(cohortId, teamId);
  }
}
