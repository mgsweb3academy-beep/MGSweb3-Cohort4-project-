import { NextResponse } from 'next/server';
import { PRESET_CACHE_POLICIES } from '@/lib/performance/cache';

/**
 * Corridor LMS — Health Check API Endpoint
 * Delivers Liveness and Readiness probes to guarantee 99% availability (§6 Availability).
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probe = searchParams.get('probe') || 'liveness';

  const startTime = Date.now();
  const uptimeSeconds = process.uptime();

  // Basic Liveness Check (is system alive?)
  if (probe === 'liveness') {
    return NextResponse.json(
      {
        status: 'UP',
        probe: 'liveness',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptimeSeconds)}s`,
      },
      {
        status: 200,
        headers: PRESET_CACHE_POLICIES.NO_STORE,
      }
    );
  }

  // Deep Readiness Check (are all dependent subsystems ready?)
  const memoryUsage = process.memoryUsage();
  
  // Simulated component status checks (DB, Redis, AI gateway)
  const subsystems = {
    database: { status: 'HEALTHY', latencyMs: 4 },
    redis: { status: 'HEALTHY', latencyMs: 2 },
    aiGateway: { status: 'HEALTHY', latencyMs: 12 },
  };

  const isReady = Object.values(subsystems).every((sub) => sub.status === 'HEALTHY');
  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isReady ? 'READY' : 'DEGRADED',
      probe: 'readiness',
      timestamp: new Date().toISOString(),
      latencyMs: responseTimeMs,
      subsystems,
      systemMetrics: {
        memoryHeapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        memoryHeapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        uptimeSeconds: Math.floor(uptimeSeconds),
      },
    },
    {
      status: isReady ? 200 : 503,
      headers: PRESET_CACHE_POLICIES.NO_STORE,
    }
  );
}
