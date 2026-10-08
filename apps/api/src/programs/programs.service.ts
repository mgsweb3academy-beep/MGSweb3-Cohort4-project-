import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from 'db';

@Injectable()
export class ProgramsService {
  async findAll() {
    const programs = await prisma.program.findMany({
      include: {
        cohorts: true,
        courses: true,
      },
    });
    return programs;
  }

  async findOne(id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        cohorts: true,
        courses: true,
      },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async create(data: { name: string; description: string; weekCount: number; code?: string }) {
    if (!data.name || !data.weekCount || data.weekCount <= 0) {
      throw new BadRequestException('Program name and valid weekCount are required');
    }
    return prisma.program.create({
      data: {
        name: data.name,
        description: data.description || '',
      }
    });
    // Note: weekCount and code are not in the Prisma schema for Program currently.
    // If needed they should be added to the schema.
  }

  async update(id: string, data: any) {
    try {
      return await prisma.program.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        }
      });
    } catch (e) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
  }

  async delete(id: string) {
    try {
      const program = await this.findOne(id);
      if (program.cohorts.length > 0) {
        throw new BadRequestException('Cannot delete a program with associated active or historical cohorts');
      }
      await prisma.program.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
  }
}
