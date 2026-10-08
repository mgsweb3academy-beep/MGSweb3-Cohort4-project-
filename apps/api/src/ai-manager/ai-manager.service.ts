import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiManagerService {
  constructor(private prisma: PrismaService) {}

  async getConfig(id: string = 'global') {
    let config = await this.prisma.agentConfig.findUnique({
      where: { id },
    });
    if (!config) {
      config = await this.prisma.agentConfig.create({
        data: {
          id,
          name: 'Global Default Agent',
          enabled: true,
          autonomyLevel: 'suggest_only',
        },
      });
    }
    return config;
  }

  async updateConfig(id: string = 'global', data: { enabled?: boolean; autonomyLevel?: string }) {
    return this.prisma.agentConfig.upsert({
      where: { id },
      create: {
        id,
        name: 'Global Default Agent',
        enabled: data.enabled ?? true,
        autonomyLevel: data.autonomyLevel || 'suggest_only',
      },
      update: data,
    });
  }

  async getLogs() {
    return this.prisma.agentLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async logAction(agentId: string, action: string, status: string, cohortId?: string, teamId?: string, taskId?: string) {
    return this.prisma.agentLog.create({
      data: {
        agentId,
        action,
        status,
        cohortId,
        teamId,
        taskId,
      },
    });
  }
}
