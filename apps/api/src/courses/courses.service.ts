import { Injectable, NotFoundException } from '@nestjs/common';
import { Course, CourseStatus } from 'types';

@Injectable()
export class CoursesService {
  private courses: Course[] = [
    {
      id: 'course_1',
      title: 'Introduction to Web3',
      programId: 'prog_abc',
      programName: 'Web3 Foundations',
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: 'published',
      lessonCount: 5,
      enrollmentCount: 120,
    },
    {
      id: 'course_2',
      title: 'Advanced Smart Contracts',
      programId: 'prog_abc',
      programName: 'Web3 Foundations',
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: 'draft',
      lessonCount: 0,
      enrollmentCount: 0,
    }
  ];

  create(data: { title: string }): Course {
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: data.title,
      programId: 'prog_abc',
      programName: 'Web3 Foundations',
      instructorId: 'inst_1',
      instructorName: 'Alice',
      status: 'draft',
      lessonCount: 0,
      enrollmentCount: 0,
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  findAll(): Course[] {
    return this.courses;
  }

  findOne(id: string): Course {
    const course = this.courses.find(c => c.id === id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  requestReview(id: string): Course {
    const course = this.findOne(id);
    if (course.status !== 'draft') {
      throw new Error('Course must be in draft state to request review');
    }
    course.status = 'in_review';
    course.submittedAt = new Date().toISOString();
    return course;
  }

  remove(id: string): void {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    this.courses.splice(index, 1);
  }
}
