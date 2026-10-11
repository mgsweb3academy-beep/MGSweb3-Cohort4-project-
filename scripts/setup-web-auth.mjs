import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve('apps/web/.env.local');
let contents = existsSync(file) ? readFileSync(file, 'utf8') : '';
if (/^CONVEX_AUTH_PRIVATE_KEY=/m.test(contents)) {
  console.log('Signing key already configured; existing configuration preserved.');
  process.exit(0);
}
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString().replace(/\n/g, '\\n');
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'corridor-1', alg: 'RS256', use: 'sig' };
const jwks = `data:application/json;base64,${Buffer.from(JSON.stringify({ keys: [jwk] })).toString('base64')}`;
if (!/^AUTH_SECRET=/m.test(contents)) contents += `\nAUTH_SECRET=${randomBytes(32).toString('hex')}\n`;
if (!/^AUTH_URL=/m.test(contents)) contents += 'AUTH_URL=http://localhost:3000\n';
contents += `CONVEX_AUTH_PRIVATE_KEY="${pem}"\nCONVEX_AUTH_JWKS=${jwks}\n`;
writeFileSync(file, contents, { mode: 0o600 });
console.log('Saved local signing configuration in apps/web/.env.local. No secrets printed.');
console.log('Set NEXT_PUBLIC_CONVEX_URL there, then configure AUTH_URL and the public CONVEX_AUTH_JWKS on the Convex deployment.');
