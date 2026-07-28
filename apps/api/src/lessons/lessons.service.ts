import { Injectable, NotFoundException } from '@nestjs/common';
import { Lesson } from 'types';

@Injectable()
export class LessonsService {
  private lessons: Lesson[] = [
    {
      id: 'lesson_1',
      courseId: 'course_1',
      title: 'What is a Blockchain?',
      contentType: 'video',
      contentUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      order: 1,
    },
    {
      id: 'lesson_2',
      courseId: 'course_1',
      title: 'Blockchain Whitepaper',
      contentType: 'pdf',
      contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      order: 2,
    },
    {
      id: 'lesson_3',
      courseId: 'course_1',
      title: 'Writing your first smart contract',
      contentType: 'code',
      textContent: 'pragma solidity ^0.8.0;\n\ncontract HelloWorld {\n    string public greet = "Hello World!";\n}',
      order: 3,
    },
    {
      id: 'lesson_4',
      courseId: 'course_1',
      title: 'Understanding Web3 Architecture',
      contentType: 'markdown',
      textContent: '# Web3 Architecture\n\nWeb3 differs from Web2 primarily through decentralization.',
      order: 4,
    },
    {
      id: 'lesson_5',
      courseId: 'course_1',
      title: 'Interview with a Web3 Developer',
      contentType: 'audio',
      contentUrl: 'https://www.w3schools.com/html/horse.mp3',
      order: 5,
    }
  ];

  findByCourseId(courseId: string): Lesson[] {
    return this.lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  }

  findOne(id: string): Lesson {
    const lesson = this.lessons.find(l => l.id === id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  create(data: Omit<Lesson, 'id'>): Lesson {
    const newLesson: Lesson = {
      ...data,
      id: `lesson_${Date.now()}`
    };
    this.lessons.push(newLesson);
    return newLesson;
  }

  update(id: string, data: Partial<Lesson>): Lesson {
    const index = this.lessons.findIndex(l => l.id === id);
    if (index === -1) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    this.lessons[index] = { ...this.lessons[index], ...data };
    return this.lessons[index];
  }
}
