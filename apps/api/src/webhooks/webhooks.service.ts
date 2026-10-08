import { Injectable } from '@nestjs/common';
import { prisma } from 'db';

@Injectable()
export class WebhooksService {
  async handlePush(payload: any) {
    const commits = payload.commits || [];
    console.log(`Received push with ${commits.length} commits`);
    
    const ref = payload.ref || '';
    const branchName = ref.replace('refs/heads/', ''); // e.g., task-123

    if (branchName.startsWith('task-')) {
      const taskId = branchName.replace('task-', '');
      try {
        const task = await prisma.task.update({
          where: { id: taskId },
          data: { state: 'Pushed' }
        });
        
        // Ensure we track contributions for the pusher
        const authorEmail = payload.pusher?.email;
        if (authorEmail) {
          const user = await prisma.user.findUnique({ where: { email: authorEmail }});
          if (user) {
            const contribution = await prisma.contribution.findFirst({
              where: { taskId, userId: user.id }
            });
            
            if (contribution) {
              await prisma.contribution.update({
                where: { id: contribution.id },
                data: { commitCount: contribution.commitCount + commits.length }
              });
            } else {
              await prisma.contribution.create({
                data: {
                  taskId,
                  userId: user.id,
                  commitCount: commits.length,
                  compositeScore: 10.0 // Basic heuristic
                }
              });
            }
          }
        }
      } catch (err) {
        console.error(`Task ${taskId} not found or failed to update.`, err);
      }
    }
    
    return { success: true, processedCommits: commits.length };
  }

  async handlePullRequest(payload: any) {
    const action = payload.action;
    const pr = payload.pull_request;
    const branchName = pr.head.ref;
    
    console.log(`Received PR event: ${action} for PR #${pr.number} on branch ${branchName}`);
    
    if (branchName.startsWith('task-')) {
      const taskId = branchName.replace('task-', '');
      let newState = '';
      
      if (action === 'opened' || action === 'reopened') {
        newState = 'In Review';
      } else if (action === 'closed' && pr.merged) {
        newState = 'Closed';
      }

      if (newState) {
        try {
          await prisma.task.update({
            where: { id: taskId },
            data: { state: newState }
          });

          if (newState === 'Closed') {
            // Composite Score Calculation: Base metrics
            // We bump the score on merge as a reward heuristic
            await prisma.contribution.updateMany({
              where: { taskId },
              data: {
                compositeScore: { increment: 50.0 }
              }
            });
          }
        } catch (err) {
          console.error(`Failed to update Task ${taskId} state to ${newState}.`, err);
        }
      }
    }
    
    return { success: true, action };
  }
}
