import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program } from 'types';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  findAll(): Program[] {
    return this.programsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Program {
    return this.programsService.findOne(id);
  }

  @Post()
  create(
    @Body() body: { name: string; description: string; weekCount: number; code?: string }
  ): Program {
    return this.programsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Program>): Program {
    return this.programsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string): { success: boolean } {
    return this.programsService.delete(id);
  }
}
