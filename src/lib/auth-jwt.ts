import crypto from 'crypto';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}

interface JWTPayload extends AuthUserPayload {
  exp: number;
  iat: number;
}

export const AUTH_COOKIE_NAME = 'auth_token';
const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Returns the secret key for signing tokens.
 */
function getAuthSecret(): string {
  return process.env.AUTH_SECRET || 'super-secret-auth-key-change-in-production-min-32-chars';
}

/**
 * Hashes a plain password using scrypt with a unique random salt.
 * Output format: salt:key
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a plain password against a stored salt:key hash using timing-safe comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!storedHash || !storedHash.includes(':')) {
      return resolve(false);
    }
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const keyBuffer = Buffer.from(key, 'hex');
        const match = crypto.timingSafeEqual(keyBuffer, derivedKey);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Base64URL encode a buffer or string.
 */
function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode to UTF-8 string.
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates an HMAC-SHA256 signed JWT token.
 */
export function createToken(payload: AuthUserPayload, expiresInSeconds = DEFAULT_EXPIRY_SECONDS): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(message)
    .digest();

  const encodedSignature = base64UrlEncode(signature);
  return `${message}.${encodedSignature}`;
}

/**
 * Verifies an HMAC-SHA256 signed JWT token.
 */
export function verifyToken(token: string): AuthUserPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', getAuthSecret())
      .update(message)
      .digest();

    const providedSignature = Buffer.from(
      encodedSignature.replace(/-/g, '+').replace(/_/g, '/') +
        '==='.slice((encodedSignature.length + 3) % 4),
      'base64'
    );

    if (expectedSignature.length !== providedSignature.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(expectedSignature, providedSignature)) {
      return null;
    }

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
