import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  async triggerManagerAction(cohortId: string, action: string, payload: any = {}) {
    try {
      const response = await fetch(`${this.aiServiceUrl}/v1/manager/act`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId, action, payload, agentId: 'manager' })
      });
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to trigger Manager agent: ${error.message}`);
      throw error;
    }
  }

  async triggerTutorAction(lessonId: string, question: string) {
    try {
      const response = await fetch(`${this.aiServiceUrl}/v1/tutor/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: 'tutor', 
          action: 'ask', 
          payload: { lessonId, question } 
        })
      });
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to trigger Tutor agent: ${error.message}`);
      throw error;
    }
  }
}
