import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} from '@/lib/auth-jwt';

describe('Auth Security Layer (Password & JWT)', () => {
  describe('Password Hashing & Verification', () => {
    it('generates unique salted hashes for the same password', async () => {
      const password = 'SecretPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(password);
      expect(hash1).not.toBe(hash2);
      expect(hash1).toContain(':');
    });

    it('verifies correct password against hash', async () => {
      const password = 'MySecurePassword456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password against hash', async () => {
      const password = 'MySecurePassword456';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('gracefully handles malformed or empty hashes', async () => {
      expect(await verifyPassword('test', '')).toBe(false);
      expect(await verifyPassword('test', 'not-a-valid-hash')).toBe(false);
    });
  });

  describe('JWT Session Tokens', () => {
    it('creates and verifies a valid JWT session token', () => {
      const payload = {
        userId: 'user-12345',
        email: 'dev@example.com',
        name: 'Alex Morgan',
      };

      const token = createToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const verified = verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.name).toBe(payload.name);
    });

    it('rejects tampered or forged JWT tokens', () => {
      const token = createToken({
        userId: 'user-1',
        email: 'test@example.com',
        name: 'Test',
      });

      const [header, payload, signature] = token.split('.');
      // Tamper signature
      const tamperedSignature = signature.slice(0, -4) + 'abcd';
      const tamperedToken = `${header}.${payload}.${tamperedSignature}`;

      expect(verifyToken(tamperedToken)).toBeNull();
    });

    it('rejects expired JWT tokens', () => {
      const token = createToken(
        { userId: 'user-1', email: 'test@example.com', name: 'Test' },
        -10 // expired 10 seconds ago
      );

      expect(verifyToken(token)).toBeNull();
    });
  });
});
