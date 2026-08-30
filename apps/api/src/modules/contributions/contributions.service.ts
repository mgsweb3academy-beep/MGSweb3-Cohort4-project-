// apps/api/src/modules/contributions/contributions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContributionsService {
  constructor(private prisma: PrismaService) {}

  async getContributions(cohortId?: string, learnerId?: string) {
    const where: any = {};
    if (cohortId) where.cohortId = cohortId;
    if (learnerId) where.learnerId = learnerId;

    const list = await this.prisma.contribution.findMany({
      where,
      include: { user: true },
    });

    return list.map((c) => ({
      learnerId: c.learnerId,
      learnerName: c.user?.name || '',
      taskId: c.taskId,
      cohortId: c.cohortId,
      compositeScore: c.compositeScore,
      rawCommitCount: c.rawCommitCount,
      filesDistinct: c.filesDistinct,
      linesApproved: c.linesApproved,
      reviewsGiven: c.reviewsGiven,
      weekBreakdown: JSON.parse(c.weekBreakdown || '[]'),
    }));
  }
}
