export type AgentAutonomyLevel = 'suggest_only' | 'autonomous';

export interface AgentConfig {
  id: string; // e.g. 'manager', 'review', 'progress-coach'
  name: string;
  enabled: boolean;
  autonomyLevel: AgentAutonomyLevel;
}

export type AgentLogStatus = 'applied' | 'proposed';

export interface AgentLog {
  id: string;
  agentId: string; // which agent took the action
  action: string;  // e.g. "Reopened 3 tasks merged without review."
  status: AgentLogStatus;
  timestamp: string;
  cohortId?: string; // Optional context
  teamId?: string;   // Optional context
  taskId?: string;   // Optional context
}
