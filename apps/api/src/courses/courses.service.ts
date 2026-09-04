import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'db';
import { Course, CourseStatus } from 'types';

@Injectable()
export class CoursesService {
  async create(data: { title: string }): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        status: 'draft',
        // Mocking the program/instructor relations for now since we don't have auth context
        program: {
          create: {
            name: 'Web3 Foundations',
          }
        }
      },
      include: {
        program: true,
        lessons: true
      }
    });

    return {
      id: course.id,
      title: course.title,
      programId: course.programId,
      programName: course.program.name,
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: course.status as CourseStatus,
      lessonCount: course.lessons.length,
      enrollmentCount: 0,
    };
  }

  async findAll(): Promise<Course[]> {
    const courses = await prisma.course.findMany({
      include: {
        program: true,
        lessons: true
      }
    });
    
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      programId: course.programId,
      programName: course.program.name,
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: course.status as CourseStatus,
      lessonCount: course.lessons.length,
      enrollmentCount: 0,
    }));
  }

  async findOne(id: string): Promise<Course> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        program: true,
        lessons: true
      }
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return {
      id: course.id,
      title: course.title,
      programId: course.programId,
      programName: course.program.name,
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: course.status as CourseStatus,
      lessonCount: course.lessons.length,
      enrollmentCount: 0,
    };
  }

  async requestReview(id: string): Promise<Course> {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    if (course.status !== 'draft') {
      throw new Error('Course must be in draft state to request review');
    }
    
    const updated = await prisma.course.update({
      where: { id },
      data: { status: 'in_review' },
      include: { program: true, lessons: true }
    });

    return {
      id: updated.id,
      title: updated.title,
      programId: updated.programId,
      programName: updated.program.name,
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: updated.status as CourseStatus,
      lessonCount: updated.lessons.length,
      enrollmentCount: 0,
    };
  }

  async remove(id: string): Promise<void> {
    try {
      await prisma.course.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }
}
