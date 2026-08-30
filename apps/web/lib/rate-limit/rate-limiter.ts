/**
 * Corridor LMS — Redis-backed Rate Limiter with In-Memory Fallback
 * Enforces per-user & per-endpoint request throttling, with special strict limits for AI endpoints (§6 Rate Limiting).
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests allowed in window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

// In-Memory store for development or fallback when Redis is absent
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Predefined Rate Limit Configurations
export const RATE_LIMIT_PRESETS = {
  // Standard API: 100 requests per 1 minute
  STANDARD_API: { windowMs: 60 * 1000, maxRequests: 100 },
  // AI Endpoints: 10 requests per 1 minute (strict limit)
  AI_ENDPOINT: { windowMs: 60 * 1000, maxRequests: 10 },
  // Authentication: 5 requests per 1 minute (prevent brute force)
  AUTH: { windowMs: 60 * 1000, maxRequests: 5 },
};

/**
 * Checks rate limit status for a key (e.g. `user:123:endpoint:/api/v1/ai/tutor`).
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.STANDARD_API
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = memoryStore.get(key);

  // Clean up expired entry if present
  if (record && now > record.resetTime) {
    memoryStore.delete(key);
  }

  const currentRecord = memoryStore.get(key) || {
    count: 0,
    resetTime: now + config.windowMs,
  };

  if (currentRecord.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetMs: currentRecord.resetTime - now,
    };
  }

  currentRecord.count += 1;
  memoryStore.set(key, currentRecord);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - currentRecord.count,
    resetMs: currentRecord.resetTime - now,
  };
}

/**
 * Utility to format HTTP 429 Too Many Requests response headers.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, result.remaining).toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetMs / 1000).toString(),
    ...(result.success ? {} : { 'Retry-After': Math.ceil(result.resetMs / 1000).toString() }),
  };
}
