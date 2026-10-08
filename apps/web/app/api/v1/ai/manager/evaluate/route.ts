import { NextResponse } from 'next/server';
import { MOCK_TASKS, MOCK_AGENT_LOGS, AGENT_CONFIG } from '@/lib/mock-data';
import type { AgentLog, AgentLogStatus } from '@/lib/types';
import crypto from 'crypto';

/**
 * POST /api/v1/ai/manager/evaluate
 * Triggers the AI Manager's evaluation cycle.
 * Checks for:
 * 1. Stalled reviews (Tasks In Review for > 3 days)
 * 2. Imbalanced contributions (placeholder logic based on task states or mock scores)
 */
export async function POST() {
  const managerConfig = AGENT_CONFIG.find(c => c.id === 'manager');
  if (!managerConfig || !managerConfig.enabled) {
    return NextResponse.json({ message: 'Manager agent is disabled' }, { status: 400 });
  }

  const logStatus: AgentLogStatus = managerConfig.autonomyLevel === 'autonomous' ? 'applied' : 'proposed';
  const newLogs: AgentLog[] = [];
  const now = new Date();

  // 1. Check for stalled reviews
  const stalledTasks = MOCK_TASKS.filter(task => {
    if (task.state !== 'In Review') return false;
    
    // Find the date of the last transition to 'In Review'
    const transition = task.transitions.slice().reverse().find(t => t.to === 'In Review');
    if (!transition) return false;

    const transitionDate = new Date(transition.at);
    const diffDays = (now.getTime() - transitionDate.getTime()) / (1000 * 3600 * 24);
    
    // threshold is 3 days
    return diffDays > 3;
  });

  if (stalledTasks.length > 0) {
    newLogs.push({
      id: `log-${crypto.randomBytes(4).toString('hex')}`,
      agentId: 'manager',
      action: `Escalated ${stalledTasks.length} stalled task reviews to instructor.`,
      status: logStatus,
      timestamp: now.toISOString(),
      cohortId: stalledTasks[0].cohortId // picking the first one's cohort for context
    });
  }

  // 2. Mock Imbalance Check (In a real scenario, this would query Part 6 commit stats)
  // For the sake of the mock, we'll just hardcode an imbalance detection if no other logs fired
  if (newLogs.length === 0) {
    newLogs.push({
      id: `log-${crypto.randomBytes(4).toString('hex')}`,
      agentId: 'manager',
      action: 'Flagged Team 4 — one member wrote 82% of the contribution.',
      status: logStatus,
      timestamp: now.toISOString(),
      cohortId: 'c07',
      teamId: 't4'
    });
  }

  // Apply logs
  MOCK_AGENT_LOGS.push(...newLogs);

  return NextResponse.json({ logs: newLogs });
}
