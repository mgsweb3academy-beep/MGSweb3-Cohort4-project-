import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'db';
import { Lesson, LessonContentType } from 'types';

@Injectable()
export class LessonsService {
  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    
    return lessons.map(l => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      contentType: l.contentType as LessonContentType,
      contentUrl: l.contentUrl ?? undefined,
      textContent: l.textContent ?? undefined,
      order: l.order,
    }));
  }

  async findOne(id: string): Promise<Lesson> {
    const l = await prisma.lesson.findUnique({ where: { id } });
    if (!l) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return {
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      contentType: l.contentType as LessonContentType,
      contentUrl: l.contentUrl ?? undefined,
      textContent: l.textContent ?? undefined,
      order: l.order,
    };
  }

  async create(data: Omit<Lesson, 'id'>): Promise<Lesson> {
    const l = await prisma.lesson.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        contentType: data.contentType,
        contentUrl: data.contentUrl,
        textContent: data.textContent,
        order: data.order,
      }
    });

    return {
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      contentType: l.contentType as LessonContentType,
      contentUrl: l.contentUrl ?? undefined,
      textContent: l.textContent ?? undefined,
      order: l.order,
    };
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    try {
      const l = await prisma.lesson.update({
        where: { id },
        data: {
          title: data.title,
          contentType: data.contentType,
          contentUrl: data.contentUrl,
          textContent: data.textContent,
          order: data.order,
        }
      });
      return {
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        contentType: l.contentType as LessonContentType,
        contentUrl: l.contentUrl ?? undefined,
        textContent: l.textContent ?? undefined,
        order: l.order,
      };
    } catch (e) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
  }
}
