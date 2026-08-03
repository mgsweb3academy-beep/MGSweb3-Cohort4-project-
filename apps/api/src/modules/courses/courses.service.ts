// apps/api/src/modules/courses/courses.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Courses
  async getCourses() {
    const courses = await this.prisma.course.findMany({
      include: {
        program: true,
        instructor: true,
        lessons: true,
      },
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      programId: c.programId,
      programName: c.program?.name || '',
      instructorId: c.instructorId,
      instructorName: c.instructor?.name || '',
      status: c.status,
      submittedAt: c.submittedAt?.toISOString(),
      reviewedAt: c.reviewedAt?.toISOString(),
      reviewedBy: c.reviewedBy,
      rejectionReason: c.rejectionReason,
      publishedAt: c.publishedAt?.toISOString(),
      lessonCount: c.lessons.length,
      enrollmentCount: 0,
    }));
  }

  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        program: true,
        instructor: true,
        lessons: { orderBy: { order: 'asc' } },
      },
    });

    if (!course) {
      throw new NotFoundException({ error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
    }

    return {
      id: course.id,
      title: course.title,
      programId: course.programId,
      programName: course.program?.name || '',
      instructorId: course.instructorId,
      instructorName: course.instructor?.name || '',
      status: course.status,
      lessons: course.lessons.map((l) => ({
        id: l.id,
        courseId: l.courseId,
        title: l.title,
        contentType: l.contentType,
        contentUrl: l.contentUrl,
        textContent: l.textContent,
        order: l.order,
      })),
    };
  }

  async createCourse(instructorId: string, data: { title: string; programId: string }) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        programId: data.programId,
        instructorId,
        status: 'draft',
      },
    });
  }

  // Course State Machine
  async requestReview(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'draft' && course.status !== 'rejected') {
      throw new BadRequestException({ error: { code: 'INVALID_STATE_TRANSITION', message: 'Course can only enter review from draft or rejected state' } });
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'in_review',
        submittedAt: new Date(),
      },
    });
  }

  async approveCourse(courseId: string, adminId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'in_review') {
      throw new BadRequestException({ error: { code: 'INVALID_STATE_TRANSITION', message: 'Course must be in_review to be approved' } });
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'published',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        publishedAt: new Date(),
      },
    });
  }

  async rejectCourse(courseId: string, adminId: string, rejectionReason: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== 'in_review') {
      throw new BadRequestException({ error: { code: 'INVALID_STATE_TRANSITION', message: 'Course must be in_review to be rejected' } });
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason,
      },
    });
  }

  // Lessons
  async getLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } });
    }
    return lesson;
  }

  async createLesson(data: { courseId: string; title: string; contentType: any; contentUrl?: string; textContent?: string; order?: number }) {
    return this.prisma.lesson.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        contentType: data.contentType || 'markdown',
        contentUrl: data.contentUrl,
        textContent: data.textContent,
        order: data.order || 1,
      },
    });
  }

  async updateLesson(id: string, data: { title?: string; textContent?: string; contentUrl?: string }) {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  // Lesson Progress
  async getLessonProgress(lessonId: string, userId: string) {
    let progress = await this.prisma.lessonProgress.findUnique({
      where: { lessonId_userId: { lessonId, userId } },
      include: { bookmarks: true, notes: true },
    });

    if (!progress) {
      progress = await this.prisma.lessonProgress.create({
        data: { lessonId, userId, lastPosition: 0, isCompleted: false },
        include: { bookmarks: true, notes: true },
      });
    }

    return progress;
  }

  async updateLessonProgress(lessonId: string, userId: string, data: { lastPosition?: number; isCompleted?: boolean }) {
    return this.prisma.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId } },
      create: {
        lessonId,
        userId,
        lastPosition: data.lastPosition || 0,
        isCompleted: data.isCompleted || false,
      },
      update: data,
      include: { bookmarks: true, notes: true },
    });
  }

  async addBookmark(lessonId: string, userId: string, data: { position: number; label: string }) {
    const progress = await this.getLessonProgress(lessonId, userId);
    return this.prisma.bookmark.create({
      data: {
        lessonProgressId: progress.id,
        position: data.position,
        label: data.label,
      },
    });
  }

  async addNote(lessonId: string, userId: string, data: { position: number; content: string }) {
    const progress = await this.getLessonProgress(lessonId, userId);
    return this.prisma.note.create({
      data: {
        lessonProgressId: progress.id,
        position: data.position,
        content: data.content,
      },
    });
  }
}
