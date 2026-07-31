import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Program } from 'types';

@Injectable()
export class ProgramsService {
  private programs: Program[] = [
    {
      id: 'p1',
      name: 'Backend Engineering',
      code: 'BE-101',
      description: 'Smart contract development and on-chain architecture.',
      weekCount: 8,
      courseIds: ['crs1', 'crs2', 'crs4'],
      cohortIds: ['c05', 'c06', 'c07'],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'p2',
      name: 'Web3 Foundations',
      code: 'W3F-100',
      description: 'DApps, wallets, and the EVM for non-engineers.',
      weekCount: 6,
      courseIds: ['crs3'],
      cohortIds: ['c05'],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  findAll(): Program[] {
    return this.programs;
  }

  findOne(id: string): Program {
    const program = this.programs.find((p) => p.id === id);
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  create(data: { name: string; description: string; weekCount: number; code?: string }): Program {
    if (!data.name || !data.weekCount || data.weekCount <= 0) {
      throw new BadRequestException('Program name and valid weekCount are required');
    }
    const newProgram: Program = {
      id: `p_${Date.now()}`,
      name: data.name,
      code: data.code || `PROG-${Math.floor(100 + Math.random() * 900)}`,
      description: data.description || '',
      weekCount: Number(data.weekCount),
      courseIds: [],
      cohortIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.programs.push(newProgram);
    return newProgram;
  }

  update(id: string, data: Partial<Program>): Program {
    const program = this.findOne(id);
    if (data.name) program.name = data.name;
    if (data.description !== undefined) program.description = data.description;
    if (data.weekCount) program.weekCount = Number(data.weekCount);
    if (data.code) program.code = data.code;
    program.updatedAt = new Date().toISOString();
    return program;
  }

  delete(id: string): { success: boolean } {
    const index = this.programs.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    if (this.programs[index].cohortIds && this.programs[index].cohortIds.length > 0) {
      throw new BadRequestException('Cannot delete a program with associated active or historical cohorts');
    }
    this.programs.splice(index, 1);
    return { success: true };
  }
}
