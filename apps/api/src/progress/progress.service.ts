import { Injectable } from '@nestjs/common';
import { LessonProgress, Bookmark, Note } from 'types';
import { randomUUID } from 'crypto';

@Injectable()
export class ProgressService {
  private progressMap: Map<string, LessonProgress> = new Map();

  private getProgressKey(lessonId: string, userId: string): string {
    return `${lessonId}-${userId}`;
  }

  getProgress(lessonId: string, userId: string): LessonProgress {
    const key = this.getProgressKey(lessonId, userId);
    if (!this.progressMap.has(key)) {
      this.progressMap.set(key, {
        lessonId,
        userId,
        lastPosition: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });
    }
    return this.progressMap.get(key)!;
  }

  updateProgress(lessonId: string, userId: string, lastPosition: number): LessonProgress {
    const progress = this.getProgress(lessonId, userId);
    progress.lastPosition = lastPosition;
    return progress;
  }

  addBookmark(lessonId: string, userId: string, position: number, label: string): Bookmark {
    const progress = this.getProgress(lessonId, userId);
    const bookmark: Bookmark = {
      id: `bm_${randomUUID()}`,
      position,
      label,
    };
    progress.bookmarks.push(bookmark);
    return bookmark;
  }

  addNote(lessonId: string, userId: string, position: number, content: string): Note {
    const progress = this.getProgress(lessonId, userId);
    const note: Note = {
      id: `note_${randomUUID()}`,
      position,
      content,
    };
    progress.notes.push(note);
    return note;
  }
}
