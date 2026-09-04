import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'db';

@Injectable()
export class ProgressService {
  async getProgress(lessonId: string, userId: string) {
    let progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      include: {
        bookmarks: true,
        notes: true,
      },
    });

    if (!progress) {
      progress = await prisma.lessonProgress.create({
        data: {
          userId,
          lessonId,
        },
        include: {
          bookmarks: true,
          notes: true,
        },
      });
    }
    return progress;
  }

  async updateProgress(lessonId: string, userId: string, lastPosition: number) {
    return prisma.lessonProgress.update({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      data: {
        lastPosition,
      },
      include: {
        bookmarks: true,
        notes: true,
      },
    });
  }

  async addBookmark(lessonId: string, userId: string, position: number, label: string) {
    const progress = await this.getProgress(lessonId, userId);
    return prisma.bookmark.create({
      data: {
        lessonProgressId: progress.id,
        position,
        label,
      },
    });
  }

  async addNote(lessonId: string, userId: string, position: number, content: string) {
    const progress = await this.getProgress(lessonId, userId);
    return prisma.note.create({
      data: {
        lessonProgressId: progress.id,
        position,
        content,
      },
    });
  }
}
