// apps/api/src/modules/courses/courses.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Admins see everything, instructors see published courses plus their own, everyone else only published courses.
  private visibilityFilter(user: { id: string; role: string }) {
    if (user.role === 'admin') return {};
    if (user.role === 'instructor') return { OR: [{ status: 'published' as const }, { instructorId: user.id }] };
    return { status: 'published' as const };
  }

  private canManageCourse(user: { id: string; role: string }, course: { instructorId: string }) {
    return user.role === 'admin' || (user.role === 'instructor' && course.instructorId === user.id);
  }

  private async assertCanManageCourse(courseId: string, user: { id: string; role: string }) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException({ error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' } });
    if (!this.canManageCourse(user, course)) {
      throw new ForbiddenException({ error: { code: 'FORBIDDEN', message: 'You do not manage this course' } });
    }
    return course;
  }

  private async assertLessonReadable(lessonId: string, user: { id: string; role: string }) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
    if (!lesson) throw new NotFoundException({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } });
    if (lesson.course.status !== 'published' && !this.canManageCourse(user, lesson.course)) {
      throw new NotFoundException({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } });
    }
    return lesson;
  }

  // Courses
  async getCourses(user: { id: string; role: string }) {
    const courses = await this.prisma.course.findMany({
      where: this.visibilityFilter(user),
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

  async getCourseById(id: string, user: { id: string; role: string }) {
    const course = await this.prisma.course.findFirst({
      where: { id, ...this.visibilityFilter(user) },
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
  async requestReview(courseId: string, user: { id: string; role: string }) {
    const course = await this.assertCanManageCourse(courseId, user);
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
  async getLessonById(id: string, user: { id: string; role: string }) {
    const { course, ...lesson } = await this.assertLessonReadable(id, user);
    return lesson;
  }

  async createLesson(
    data: { courseId: string; title: string; contentType: any; contentUrl?: string; textContent?: string; order?: number },
    user: { id: string; role: string },
  ) {
    await this.assertCanManageCourse(data.courseId, user);
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

  async updateLesson(
    id: string,
    data: { title?: string; textContent?: string; contentUrl?: string },
    user: { id: string; role: string },
  ) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException({ error: { code: 'LESSON_NOT_FOUND', message: 'Lesson not found' } });
    await this.assertCanManageCourse(lesson.courseId, user);

    return this.prisma.lesson.update({
      where: { id },
      data: { title: data.title, textContent: data.textContent, contentUrl: data.contentUrl },
    });
  }

  // Lesson Progress
  async getLessonProgress(lessonId: string, user: { id: string; role: string }) {
    await this.assertLessonReadable(lessonId, user);
    return this.findOrCreateProgress(lessonId, user.id);
  }

  private async findOrCreateProgress(lessonId: string, userId: string) {
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

  async updateLessonProgress(lessonId: string, user: { id: string; role: string }, data: { lastPosition?: number; isCompleted?: boolean }) {
    await this.assertLessonReadable(lessonId, user);
    // Only whitelisted fields are copied so a request body cannot rewrite userId/lessonId.
    const changes = { lastPosition: data.lastPosition, isCompleted: data.isCompleted };
    return this.prisma.lessonProgress.upsert({
      where: { lessonId_userId: { lessonId, userId: user.id } },
      create: {
        lessonId,
        userId: user.id,
        lastPosition: data.lastPosition || 0,
        isCompleted: data.isCompleted || false,
      },
      update: changes,
      include: { bookmarks: true, notes: true },
    });
  }

  async addBookmark(lessonId: string, user: { id: string; role: string }, data: { position: number; label: string }) {
    await this.assertLessonReadable(lessonId, user);
    const progress = await this.findOrCreateProgress(lessonId, user.id);
    return this.prisma.bookmark.create({
      data: {
        lessonProgressId: progress.id,
        position: data.position,
        label: data.label,
      },
    });
  }

  async addNote(lessonId: string, user: { id: string; role: string }, data: { position: number; content: string }) {
    await this.assertLessonReadable(lessonId, user);
    const progress = await this.findOrCreateProgress(lessonId, user.id);
    return this.prisma.note.create({
      data: {
        lessonProgressId: progress.id,
        position: data.position,
        content: data.content,
      },
    });
  }
}
