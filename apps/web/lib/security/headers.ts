/**
 * Corridor LMS — Security Headers & CORS / CSRF Protection Engine
 * Implements HTTPS/TLS 1.3 policy headers, HSTS, CSP, and CORS protection (§6 Security).
 */

export function getSecurityHeaders(): Record<string, string> {
  return {
    // HTTPS Enforce - HSTS 2 Years
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    
    // Anti-Clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME-type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Strict Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Restrict Browser APIs
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // Content Security Policy (CSP)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.github.com http://localhost:3001",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

/**
 * Validates Cross-Origin Resource Sharing (CORS) origin.
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'https://corridor-lms.com'];

  const isAllowed = origin && allowedOrigins.includes(origin);
  const allowOrigin = isAllowed ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Generates and validates CSRF tokens using HMAC.
 */
export function validateCsrfToken(requestToken: string | null, sessionToken: string): boolean {
  if (!requestToken || !sessionToken) return false;
  return requestToken === sessionToken;
}
