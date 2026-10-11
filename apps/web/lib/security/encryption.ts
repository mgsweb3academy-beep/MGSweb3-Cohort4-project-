/**
 * Corridor LMS — Encryption & Hashing Engine
 * Provides AES-256-GCM symmetric data-at-rest encryption and secure password hashing (§6 Security).
 */

import { webcrypto } from 'crypto';

const cryptoApi: Crypto = (globalThis.crypto ?? webcrypto) as Crypto;

function encryptionSecret() {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) throw new Error('ENCRYPTION_SECRET is required');
  return secret;
}

/**
 * Derives a CryptoKey from a secret passphrase using PBKDF2 with 100,000 iterations.
 */
async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return cryptoApi.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt).buffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts sensitive string data using AES-256-GCM.
 */
export async function encryptPayload(
  text: string,
  secretKey: string = encryptionSecret()
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const iv = cryptoApi.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(secretKey, salt);
  const encryptedBuffer = await cryptoApi.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(text)
  );

  return {
    ciphertext: Buffer.from(encryptedBuffer).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    salt: Buffer.from(salt).toString('base64'),
  };
}

/**
 * Decrypts AES-256-GCM encrypted payload back to plaintext.
 */
export async function decryptPayload(
  encrypted: { ciphertext: string; iv: string; salt: string },
  secretKey: string = encryptionSecret()
): Promise<string> {
  const dec = new TextDecoder();
  const ciphertextBuffer = Buffer.from(encrypted.ciphertext, 'base64');
  const ivBuffer = Buffer.from(encrypted.iv, 'base64');
  const saltBuffer = Buffer.from(encrypted.salt, 'base64');

  const key = await deriveKey(secretKey, saltBuffer);

  const decryptedBuffer = await cryptoApi.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    ciphertextBuffer
  );

  return dec.decode(decryptedBuffer);
}

/**
 * Hashes a password securely using PBKDF2 + SHA-256 with salt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = cryptoApi.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();

  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 310000, // OWASP recommended iteration count
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const saltHex = Buffer.from(salt).toString('hex');
  const hashHex = Buffer.from(derivedBits).toString('hex');
  return `pbkdf2_sha256$310000$${saltHex}$${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return false;
  }

  const iterations = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], 'hex');
  const targetHashHex = parts[3];

  const enc = new TextEncoder();
  const keyMaterial = await cryptoApi.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await cryptoApi.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const computedHashHex = Buffer.from(derivedBits).toString('hex');
  return computedHashHex === targetHashHex;
}
