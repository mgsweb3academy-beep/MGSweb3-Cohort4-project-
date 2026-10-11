// apps/api/src/common/jwt-secret.ts
const DEV_FALLBACK_SECRET = 'corridor_dev_secret_key_change_in_prod';

// Resolved lazily so values loaded by ConfigModule (.env) are visible, and so production
// never silently signs tokens with the well-known development secret.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && !(process.env.NODE_ENV === 'production' && secret === DEV_FALLBACK_SECRET)) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a non-default value in production');
  }
  return DEV_FALLBACK_SECRET;
}
