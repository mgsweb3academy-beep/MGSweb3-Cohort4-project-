import { NextResponse } from 'next/server';
import { MOCK_AGENT_LOGS } from '@/lib/mock-data';

/**
 * GET /api/v1/ai/manager/logs
 * Retrieves the action history of the AI Manager.
 */
export async function GET() {
  // Return logs sorted by timestamp descending
  const sortedLogs = [...MOCK_AGENT_LOGS].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  return NextResponse.json({ logs: sortedLogs });
}
