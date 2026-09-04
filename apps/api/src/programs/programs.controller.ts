import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { Program } from 'types';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async findAll() {
    return this.programsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.programsService.findOne(id);
  }

  @Post()
  async create(
    @Body() body: { name: string; description: string; weekCount: number; code?: string }
  ) {
    return this.programsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.programsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.programsService.delete(id);
  }
}
