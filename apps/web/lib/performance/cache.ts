/**
 * Corridor LMS — Cache Control & Performance Engine
 * Configures HTTP Cache headers and stale-while-revalidate policies to guarantee <2s page loads (§6 Performance).
 */

export interface CachePolicyOptions {
  maxAgeSeconds?: number;
  staleWhileRevalidateSeconds?: number;
  isPrivate?: boolean;
}

export function getCacheHeaders(options: CachePolicyOptions = {}): Record<string, string> {
  const {
    maxAgeSeconds = 60,
    staleWhileRevalidateSeconds = 300,
    isPrivate = false,
  } = options;

  const visibility = isPrivate ? 'private' : 'public';
  const headerValue = `${visibility}, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`;

  return {
    'Cache-Control': headerValue,
  };
}

export const PRESET_CACHE_POLICIES = {
  // Static content (e.g. course assets, marketing): Cache for 1 hour, SWR 1 day
  STATIC_ASSETS: getCacheHeaders({ maxAgeSeconds: 3600, staleWhileRevalidateSeconds: 86400 }),
  
  // Dashboard & Task Boards: Cache 30s, SWR 5 mins
  DYNAMIC_DASHBOARD: getCacheHeaders({ maxAgeSeconds: 30, staleWhileRevalidateSeconds: 300, isPrivate: true }),
  
  // Real-time AI & Auth Endpoints: Never cache
  NO_STORE: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
};
