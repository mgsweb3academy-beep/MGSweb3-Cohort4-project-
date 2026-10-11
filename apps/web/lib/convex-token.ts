import 'server-only';
import { importPKCS8, SignJWT } from 'jose';

export async function createConvexToken(email: string, sessionVersion?: number, service = false) {
  const pem = process.env.CONVEX_AUTH_PRIVATE_KEY;
  const issuer = process.env.AUTH_URL;
  if (!pem || !issuer) throw new Error('Configure CONVEX_AUTH_PRIVATE_KEY and AUTH_URL');
  const key = await importPKCS8(pem.replace(/\\n/g, '\n'), 'RS256');
  return new SignJWT({ service, email: email.trim().toLowerCase(), ...(sessionVersion === undefined ? {} : { sessionVersion }) })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'corridor-1' })
    .setSubject(email.trim().toLowerCase()).setIssuer(issuer).setAudience('corridor')
    .setIssuedAt().setExpirationTime('5m').sign(key);
}
