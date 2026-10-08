// apps/api/src/modules/discussions/discussions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  async getDiscussions(courseId?: string, cohortId?: string) {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (cohortId) where.cohortId = cohortId;

    const posts = await this.prisma.discussionPost.findMany({
      where,
      include: {
        author: true,
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((p) => ({
      id: p.id,
      courseId: p.courseId || undefined,
      cohortId: p.cohortId || undefined,
      authorId: p.authorId,
      authorName: p.author?.name || '',
      authorAvatar: p.author?.avatarUrl || undefined,
      title: p.title,
      content: p.content,
      isFlagged: p.isFlagged,
      createdAt: p.createdAt.toISOString(),
      commentCount: p.comments.length,
    }));
  }

  async createPost(authorId: string, data: { title: string; content: string; courseId?: string; cohortId?: string }) {
    const post = await this.prisma.discussionPost.create({
      data: {
        authorId,
        title: data.title,
        content: data.content,
        courseId: data.courseId,
        cohortId: data.cohortId,
      },
      include: { author: true, comments: true },
    });

    return {
      id: post.id,
      courseId: post.courseId || undefined,
      cohortId: post.cohortId || undefined,
      authorId: post.authorId,
      authorName: post.author?.name || '',
      authorAvatar: post.author?.avatarUrl || undefined,
      title: post.title,
      content: post.content,
      isFlagged: post.isFlagged,
      createdAt: post.createdAt.toISOString(),
      commentCount: 0,
    };
  }

  async flagPost(postId: string, userId: string, reason: string) {
    const post = await this.prisma.discussionPost.findUnique({
      where: { id: postId },
      include: { author: true },
    });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.discussionPost.update({
      where: { id: postId },
      data: { isFlagged: true },
    });

    // Create entry in moderation queue
    await this.prisma.moderationItem.create({
      data: {
        type: 'discussion_post',
        flaggedBy: userId,
        flagReason: reason,
        content: post.content,
        authorId: post.authorId,
        authorName: post.author?.name || 'Unknown',
        contextLabel: `Post: ${post.title}`,
        status: 'pending',
      },
    });

    return { flagged: true, postId };
  }
}
