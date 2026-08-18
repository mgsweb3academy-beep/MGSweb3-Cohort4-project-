import { Injectable, Logger } from '@nestjs/common';
import { Contribution } from 'types';

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);
  
  // In-memory mock storage for contributions
  private contributions: Map<string, Contribution> = new Map();

  constructor() {}

  async processWebhookPayload(event: string, payload: any): Promise<void> {
    this.logger.log(`Received GitHub webhook event: ${event}`);

    // In a real application, we would use Redis/Bull to queue these processing tasks.
    // For local development, we process synchronously with simulated delay.

    try {
      if (event === 'push') {
        await this.handlePushEvent(payload);
      } else if (event === 'pull_request') {
        await this.handlePullRequestEvent(payload);
      } else if (event === 'pull_request_review') {
        await this.handlePullRequestReviewEvent(payload);
      } else {
        this.logger.log(`Ignoring unhandled webhook event: ${event}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event}`, error);
      // Here we would implement retry logic via the Redis queue
      throw error; 
    }
  }

  private async handlePushEvent(payload: any) {
    // 1. Identify branch and task. Branch naming convention: e.g. task/task-id-123
    const ref = payload.ref;
    const branchName = ref?.replace('refs/heads/', '') || '';
    const taskIdMatch = branchName.match(/task\/(.+)/);
    
    // We assume the username or email is tied to a learnerId
    const githubUsername = payload.sender?.login;

    if (!githubUsername) return;

    const taskId = taskIdMatch ? taskIdMatch[1] : 'unknown-task';
    const cohortId = 'cohort-07'; // Mock cohort ID

    const contribution = this.getOrCreateContribution(githubUsername, taskId, cohortId);

    // 2. Tally raw commits and distinct files touched
    const commits = payload.commits || [];
    contribution.rawCommitCount += commits.length;

    const modifiedFiles = new Set<string>();
    for (const commit of commits) {
      commit.added?.forEach((f: string) => modifiedFiles.add(f));
      commit.modified?.forEach((f: string) => modifiedFiles.add(f));
      commit.removed?.forEach((f: string) => modifiedFiles.add(f));
    }
    
    // Simplistic distinct file count addition
    contribution.filesDistinct += modifiedFiles.size;

    // Detect Force Push or Deleted Branch
    if (payload.forced) {
      this.logger.warn(`Force push detected on branch ${branchName}`);
      // Push an event to the AI manager stream to flag this
    }
    if (payload.deleted) {
      this.logger.warn(`Branch ${branchName} deleted before review`);
      // Reopen task to 'Pushed' and flag to manager
    }

    this.updateCompositeScore(contribution);
    this.logger.log(`Updated contribution for ${githubUsername} on task ${taskId}: Score ${contribution.compositeScore}`);
  }

  private async handlePullRequestEvent(payload: any) {
    const action = payload.action;
    const githubUsername = payload.pull_request?.user?.login;
    const branchName = payload.pull_request?.head?.ref || '';
    const taskIdMatch = branchName.match(/task\/(.+)/);
    const taskId = taskIdMatch ? taskIdMatch[1] : 'unknown-task';
    const cohortId = 'cohort-07'; // Mock

    if (!githubUsername) return;

    if (action === 'closed' && payload.pull_request?.merged) {
      // Lines that survived review (additions - deletions, simplified)
      const additions = payload.pull_request?.additions || 0;
      const deletions = payload.pull_request?.deletions || 0;
      const netLines = Math.max(0, additions - deletions);

      const contribution = this.getOrCreateContribution(githubUsername, taskId, cohortId);
      contribution.linesApproved += netLines;
      
      this.updateCompositeScore(contribution);
      this.logger.log(`Pull request merged for ${githubUsername} on task ${taskId}: Score ${contribution.compositeScore}`);
    }
  }

  private async handlePullRequestReviewEvent(payload: any) {
    const action = payload.action;
    // The person WHO GAVE the review
    const reviewerUsername = payload.review?.user?.login;
    const branchName = payload.pull_request?.head?.ref || '';
    const taskIdMatch = branchName.match(/task\/(.+)/);
    const taskId = taskIdMatch ? taskIdMatch[1] : 'unknown-task';
    const cohortId = 'cohort-07'; // Mock

    if (!reviewerUsername) return;

    if (action === 'submitted') {
      const contribution = this.getOrCreateContribution(reviewerUsername, taskId, cohortId);
      contribution.reviewsGiven += 1;
      
      this.updateCompositeScore(contribution);
      this.logger.log(`Review submitted by ${reviewerUsername} on task ${taskId}: Score ${contribution.compositeScore}`);
    }
  }

  private getOrCreateContribution(githubUsername: string, taskId: string, cohortId: string): Contribution {
    const key = `${githubUsername}-${taskId}`;
    if (!this.contributions.has(key)) {
      this.contributions.set(key, {
        learnerId: githubUsername, // Mock ID mapping
        learnerName: githubUsername,
        taskId,
        cohortId,
        compositeScore: 0,
        rawCommitCount: 0,
        filesDistinct: 0,
        linesApproved: 0,
        reviewsGiven: 0,
        weekBreakdown: [0, 0, 0, 0, 0, 0, 0, 0],
      });
    }
    return this.contributions.get(key)!;
  }

  private updateCompositeScore(c: Contribution) {
    // Composite score formula per PRD requirements:
    // Distinct files touched + Lines that survived review + (Reviews given * 10)
    // Raw commit count is explicitly EXCLUDED from the primary score to prevent gaming.
    c.compositeScore = c.filesDistinct + c.linesApproved + (c.reviewsGiven * 10);
  }

  // --- API for Frontend ---
  getContributionsForCohort(cohortId: string): Contribution[] {
    return Array.from(this.contributions.values()).filter(c => c.cohortId === cohortId);
  }
}
