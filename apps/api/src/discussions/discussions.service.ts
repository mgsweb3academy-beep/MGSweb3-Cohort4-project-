import { Injectable, Logger } from '@nestjs/common';
import { Thread, Post, ThreadScope, ModerationItem } from 'types';
import { randomUUID } from 'crypto';

@Injectable()
export class DiscussionsService {
  private readonly logger = new Logger(DiscussionsService.name);
  private threads: Thread[] = [];
  private posts: Post[] = [];
  private moderationQueue: ModerationItem[] = []; // Part 12 Moderation mock

  async createThread(
    scopeType: ThreadScope,
    scopeId: string,
    title: string,
    authorId: string,
    authorName: string
  ): Promise<Thread> {
    const thread: Thread = {
      id: randomUUID(),
      scopeType,
      scopeId,
      title,
      authorId,
      authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postCount: 0,
    };
    this.threads.push(thread);
    return thread;
  }

  async getThreads(scopeType: ThreadScope, scopeId: string): Promise<Thread[]> {
    return this.threads
      .filter((t) => t.scopeType === scopeType && t.scopeId === scopeId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createPost(
    threadId: string,
    content: string,
    authorId: string,
    authorName: string
  ): Promise<Post> {
    const thread = this.threads.find((t) => t.id === threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    const post: Post = {
      id: randomUUID(),
      threadId,
      content,
      authorId,
      authorName,
      isAiAnswer: false,
      isFlagged: false,
      createdAt: new Date().toISOString(),
    };
    this.posts.push(post);
    
    thread.postCount += 1;
    thread.updatedAt = new Date().toISOString();

    // Trigger AI Agent (Part 9 integration) if this looks like a question
    if (content.includes('?')) {
      this.invokeAiTutor(threadId, content);
    }

    return post;
  }

  async getPosts(threadId: string): Promise<Post[]> {
    return this.posts
      .filter((p) => p.threadId === threadId && !p.isFlagged) // Hidden from general view
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async flagPost(postId: string, flaggerId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    post.isFlagged = true; // Instantly hide from general view

    // Create entry in Part 12 moderation queue
    const moderationItem: ModerationItem = {
      id: randomUUID(),
      type: 'discussion_post',
      flaggedAt: new Date().toISOString(),
      flaggedBy: flaggerId,
      flagReason: 'Flagged by user',
      content: post.content,
      authorId: post.authorId,
      authorName: post.authorName,
      contextLabel: `Thread: ${post.threadId}`,
      status: 'pending',
    };
    this.moderationQueue.push(moderationItem);
    this.logger.log(`Post ${postId} flagged and added to Moderation Queue.`);
  }

  private async invokeAiTutor(threadId: string, question: string) {
    // Mocking Part 9's AI Tutor integration
    this.logger.log(`[AI Tutor] Triggered for question: "${question}"`);
    setTimeout(() => {
      const aiPost: Post = {
        id: randomUUID(),
        threadId,
        content: `This is an AI-assisted answer to your question: "${question}"`,
        authorId: 'agent-tutor',
        authorName: 'AI Tutor',
        isAiAnswer: true,
        isFlagged: false,
        createdAt: new Date().toISOString(),
      };
      this.posts.push(aiPost);
      const thread = this.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.postCount += 1;
        thread.updatedAt = new Date().toISOString();
      }
      this.logger.log(`[AI Tutor] Answer posted in thread ${threadId}`);
    }, 1000);
  }
}
