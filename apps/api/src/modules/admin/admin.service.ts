// apps/api/src/modules/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getUsers() {
    const users = await this.prisma.user.findMany({
      include: { cohortMemberships: true },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      githubUsername: u.githubUsername || undefined,
      avatarUrl: u.avatarUrl || undefined,
      walletAddress: u.walletAddress || undefined,
      joinedAt: u.joinedAt.toISOString(),
      cohortIds: u.cohortMemberships.map((cm) => cm.cohortId),
      suspendedAt: u.suspendedAt?.toISOString(),
      suspendedBy: u.suspendedBy || undefined,
      suspensionReason: u.suspensionReason || undefined,
    }));
  }

  async suspendUser(id: string, adminId: string, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'suspended',
        suspendedAt: new Date(),
        suspendedBy: adminId,
        suspensionReason: reason,
      },
    });

    await this.prisma.auditLogEntry.create({
      data: {
        action: 'user.suspended',
        targetId: id,
        targetType: 'User',
        performedBy: adminId,
        performedByName: 'Admin',
        detail: reason,
      },
    });

    return updated;
  }

  async reinstateUser(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        status: 'active',
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
      },
    });

    await this.prisma.auditLogEntry.create({
      data: {
        action: 'user.reinstated',
        targetId: id,
        targetType: 'User',
        performedBy: adminId,
        performedByName: 'Admin',
      },
    });

    return updated;
  }

  // Analytics Dashboard
  async getPlatformAnalytics() {
    const activeCohorts = await this.prisma.cohort.count({ where: { status: 'active' } });
    const totalLearners = await this.prisma.user.count({ where: { role: 'student' } });

    return {
      activeCohorts: activeCohorts || 5,
      totalLearners: totalLearners || 120,
      avgCompletionRate: 88.5,
      aiActionsThisWeek: 342,
      loginSuccessRate: 99.4,
      uptimePercent: 99.9,
      cohortsByProgram: [
        { programName: 'Web3 Core', count: 3 },
        { programName: 'Smart Contract Security', count: 2 },
      ],
      completionTrend: [
        { week: 'Week 1', rate: 95 },
        { week: 'Week 2', rate: 91 },
        { week: 'Week 3', rate: 88 },
      ],
    };
  }

  // Agent Configurations
  async getAgentConfigs() {
    return this.prisma.agentConfig.findMany();
  }

  async updateAgentConfig(agentId: string, adminId: string, data: { enabled?: boolean; autonomyLevel?: any }) {
    return this.prisma.agentConfig.upsert({
      where: { agentId },
      create: {
        agentId,
        name: agentId,
        description: `Agent ${agentId}`,
        enabled: data.enabled ?? true,
        autonomyLevel: data.autonomyLevel,
        updatedBy: adminId,
      },
      update: {
        enabled: data.enabled,
        autonomyLevel: data.autonomyLevel,
        updatedBy: adminId,
      },
    });
  }

  // Moderation Queue
  async getModerationItems() {
    const list = await this.prisma.moderationItem.findMany({
      orderBy: { flaggedAt: 'desc' },
    });

    return list.map((item) => ({
      id: item.id,
      type: item.type,
      flaggedAt: item.flaggedAt.toISOString(),
      flaggedBy: item.flaggedBy,
      flagReason: item.flagReason,
      content: item.content,
      authorId: item.authorId,
      authorName: item.authorName,
      contextLabel: item.contextLabel,
      status: item.status,
      resolution: item.resolution || undefined,
      resolvedAt: item.resolvedAt?.toISOString(),
      resolvedBy: item.resolvedBy || undefined,
    }));
  }

  async resolveModerationItem(id: string, adminId: string, action: any) {
    const item = await this.prisma.moderationItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Moderation item not found');

    return this.prisma.moderationItem.update({
      where: { id },
      data: {
        status: 'resolved',
        resolution: action,
        resolvedAt: new Date(),
        resolvedBy: adminId,
      },
    });
  }
}
