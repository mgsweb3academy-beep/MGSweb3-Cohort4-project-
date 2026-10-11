import { ConvexError } from 'convex/values';
export function apiError(error: unknown) {
  const data = error instanceof ConvexError ? error.data : null;
  if (error instanceof SyntaxError || (error instanceof Error && /ArgumentValidationError|validator|does not match|missing required field/i.test(error.message))) return Response.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request payload' } }, { status: 400 });
  const code = typeof data === 'object' && data && 'code' in data ? String(data.code) : error instanceof Error && error.message === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'INTERNAL_SERVER_ERROR';
  const status = code === 'TOO_MANY_REQUESTS' ? 429 : code === 'UNAUTHORIZED' ? 401 : code === 'FORBIDDEN' ? 403 : code === 'NOT_FOUND' ? 404 : code === 'INTERNAL_SERVER_ERROR' ? 500 : 400;
  const message = typeof data === 'object' && data && 'message' in data ? String(data.message) : status === 500 ? 'Request could not be completed' : code;
  return Response.json({ error: { code, message } }, { status });
}
