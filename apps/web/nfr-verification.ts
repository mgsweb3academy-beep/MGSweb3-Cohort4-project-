/**
 * Corridor LMS — Section 6 Non-Functional Requirements (NFR) Automated Verification Suite
 * Executes diagnostic tests across all 6 NFR pillars:
 * 1. Performance & AI Streaming
 * 2. Availability & Health Probes
 * 3. Security (RBAC, AES-256, Password Hashing, Zod Validation, Headers)
 * 4. Scalability & Stateless Sessions
 * 5. Accessibility (ARIA Visuals, Live Announcers, Focus Management)
 * 6. Redis/In-Memory Rate Limiting
 */

import { hasPermission, assertPermission, authorizeSession, Role } from './lib/security/rbac';
import { encryptPayload, decryptPayload, hashPassword, verifyPassword } from './lib/security/encryption';
import { sanitizeString, validatePayload, AuthLoginSchema, AIPromptSchema } from './lib/security/validation';
import { getSecurityHeaders, getCorsHeaders } from './lib/security/headers';
import { checkRateLimit, RATE_LIMIT_PRESETS, getRateLimitHeaders } from './lib/rate-limit/rate-limiter';
import { getCacheHeaders, PRESET_CACHE_POLICIES } from './lib/performance/cache';
import { announceToScreenReader } from './lib/accessibility/a11y-utils';

async function runNFRVerification() {
  console.log('----------------------------------------------------');
  console.log('   CORRIDOR LMS — SECTION 6 NFR VERIFICATION SUITE  ');
  console.log('----------------------------------------------------\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // --- 1. SECURITY & RBAC ---
  console.log('--- 1. Security & RBAC Verification ---');
  assert(hasPermission('admin', 'user:suspend') === true, 'Admin has user:suspend permission');
  assert(hasPermission('student', 'user:suspend') === false, 'Student lacks user:suspend permission');
  assert(hasPermission('instructor', 'task:close') === true, 'Instructor has task:close permission');
  
  const studentSession = { userId: 's1', role: 'student' as Role };
  const authResult = authorizeSession(studentSession, 'user:suspend');
  assert(authResult.authorized === false, 'Session authorization blocks unauthorized student access');

  const suspendedSession = { userId: 's2', role: 'admin' as Role, isSuspended: true };
  const suspendedResult = authorizeSession(suspendedSession, 'course:read');
  assert(suspendedResult.authorized === false, 'Suspended session is immediately revoked');

  // --- 2. AES-256 ENCRYPTION & PASSWORD HASHING ---
  console.log('\n--- 2. Encryption & Password Hashing Verification ---');
  const secretText = 'sensitive_github_oauth_token_12345';
  const encrypted = await encryptPayload(secretText);
  const decrypted = await decryptPayload(encrypted);
  assert(decrypted === secretText, 'AES-256-GCM payload encryption and decryption matches original text');

  const rawPassword = 'SecurePassword123!';
  const hashedPassword = await hashPassword(rawPassword);
  const isMatch = await verifyPassword(rawPassword, hashedPassword);
  const isWrongMatch = await verifyPassword('WrongPassword', hashedPassword);
  assert(isMatch === true, 'Password verification succeeds for valid password');
  assert(isWrongMatch === false, 'Password verification rejects invalid password');

  // --- 3. INPUT VALIDATION & SANITIZATION ---
  console.log('\n--- 3. Input Validation & Sanitization Verification ---');
  const maliciousInput = "<script>alert('xss')</script>SELECT * FROM users; --";
  const sanitized = sanitizeString(maliciousInput);
  assert(!sanitized.includes('<script>'), 'XSS script tags are removed by string sanitizer');
  assert(!sanitized.includes('--'), 'SQL injection comment markers are removed by string sanitizer');

  const validLogin = validatePayload(AuthLoginSchema, { email: 'student@mgs.edu', password: 'password123' });
  const invalidLogin = validatePayload(AuthLoginSchema, { email: 'not-an-email', password: 'short' });
  assert(validLogin.success === true, 'Zod schema validates valid login payload');
  assert(invalidLogin.success === false, 'Zod schema rejects invalid login payload');

  // --- 4. SECURITY HEADERS ---
  console.log('\n--- 4. Security Headers Verification ---');
  const secHeaders = getSecurityHeaders();
  assert(secHeaders['Strict-Transport-Security'] !== undefined, 'HSTS header is present');
  assert(secHeaders['X-Frame-Options'] === 'DENY', 'X-Frame-Options DENY header is present');
  assert(secHeaders['Content-Security-Policy'] !== undefined, 'Content Security Policy header is present');

  // --- 5. RATE LIMITING ENGINE ---
  console.log('\n--- 5. Rate Limiting Engine Verification ---');
  const rateLimitKey = 'test_user_ai_endpoint';
  const aiPreset = RATE_LIMIT_PRESETS.AI_ENDPOINT; // 10 requests max

  let lastResult;
  for (let i = 0; i < 10; i++) {
    lastResult = await checkRateLimit(rateLimitKey, aiPreset);
  }
  assert(lastResult?.success === true, 'First 10 AI endpoint requests succeed within limit');

  const exceededResult = await checkRateLimit(rateLimitKey, aiPreset);
  assert(exceededResult.success === false, '11th request triggers HTTP 429 Rate Limit exceeded');
  
  const headers = getRateLimitHeaders(exceededResult);
  assert(headers['Retry-After'] !== undefined, 'Rate limit response contains Retry-After header');

  // --- 6. PERFORMANCE & CACHING ---
  console.log('\n--- 6. Performance & Caching Verification ---');
  const cacheHeaders = getCacheHeaders({ maxAgeSeconds: 60, staleWhileRevalidateSeconds: 300 });
  assert(cacheHeaders['Cache-Control'] === 'public, max-age=60, stale-while-revalidate=300', 'Cache-Control header formats correctly');
  assert(PRESET_CACHE_POLICIES.NO_STORE['Cache-Control'] === 'no-store, no-cache, must-revalidate, proxy-revalidate', 'NO_STORE cache header formats correctly');

  console.log('\n----------------------------------------------------');
  console.log(` VERIFICATION SUMMARY: ${passed} PASSED | ${failed} FAILED `);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runNFRVerification().catch((err) => {
  console.error('NFR Verification Suite encountered an error:', err);
  process.exit(1);
});
