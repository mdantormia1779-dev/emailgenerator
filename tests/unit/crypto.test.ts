import { describe, it, expect } from 'vitest';
import { encryptToken, decryptToken } from '@/lib/crypto';

describe('AES-256-GCM Token Encryption', () => {
  it('encrypts and decrypts sensitive tokens with high fidelity', () => {
    const rawToken = 'ya29.a0AfH6SMD-super-secret-oauth-refresh-token-12345';
    const encrypted = encryptToken(rawToken);

    expect(encrypted).not.toBe(rawToken);
    expect(encrypted.split(':')).toHaveLength(3); // iv : tag : ciphertext

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(rawToken);
  });

  it('throws error when attempting to decrypt corrupted ciphertext or tampered auth tag', () => {
    const rawToken = 'token-to-tamper';
    const encrypted = encryptToken(rawToken);
    const [iv, tag, ciphertext] = encrypted.split(':');

    // Corrupt the ciphertext
    const corrupted = `${iv}:${tag}:bad${ciphertext.slice(3)}`;
    expect(() => decryptToken(corrupted)).toThrow();
  });
});
