import { Controller, Get, Post, Body, Param, Req, Query } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { Thread, Post as ThreadPost, ThreadScope } from 'types';

@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  async getThreads(
    @Query('scopeType') scopeType: ThreadScope,
    @Query('scopeId') scopeId: string,
  ): Promise<Thread[]> {
    return this.discussionsService.getThreads(scopeType, scopeId);
  }

  @Post()
  async createThread(
    @Body() body: { scopeType: ThreadScope; scopeId: string; title: string },
    @Req() req: any
  ): Promise<Thread> {
    const authorId = req.user?.id || 'mock-user-1';
    const authorName = req.user?.name || 'Mock User';
    return this.discussionsService.createThread(body.scopeType, body.scopeId, body.title, authorId, authorName);
  }

  @Get(':threadId/posts')
  async getPosts(@Param('threadId') threadId: string): Promise<ThreadPost[]> {
    return this.discussionsService.getPosts(threadId);
  }

  @Post(':threadId/posts')
  async createPost(
    @Param('threadId') threadId: string,
    @Body() body: { content: string },
    @Req() req: any
  ): Promise<ThreadPost> {
    const authorId = req.user?.id || 'mock-user-1';
    const authorName = req.user?.name || 'Mock User';
    return this.discussionsService.createPost(threadId, body.content, authorId, authorName);
  }

  @Post('posts/:postId/flag')
  async flagPost(@Param('postId') postId: string, @Req() req: any): Promise<{ success: boolean }> {
    const flaggerId = req.user?.id || 'mock-user-1';
    await this.discussionsService.flagPost(postId, flaggerId);
    return { success: true };
  }
}
