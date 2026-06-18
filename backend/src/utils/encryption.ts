import crypto from 'crypto';
import { config } from '../configs/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const ENCODING = 'hex';

/**
 * Derives a 32-byte key from the config encryption key
 */
const getKey = (): Buffer => {
  const keyHex = config.encryption.key;
  if (keyHex.length !== 64) {
    throw new Error('AES_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }
  return Buffer.from(keyHex, 'hex');
};

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a string value using AES-256-GCM
 * Returns iv:authTag:encrypted as a combined string
 */
export const encrypt = (plainText: string): string => {
  if (!plainText) return plainText;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted.toString(ENCODING)}`;
};

/**
 * Decrypts a value encrypted by the encrypt() function
 */
export const decrypt = (encryptedValue: string): string => {
  if (!encryptedValue) return encryptedValue;

  // Check if the value looks encrypted (contains our separator format)
  if (!encryptedValue.includes(':')) return encryptedValue;

  const parts = encryptedValue.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const key = getKey();
  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);
  const encryptedBuffer = Buffer.from(encryptedHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  return decrypted.toString('utf8');
};

/**
 * Encrypts an object's specified fields
 */
export const encryptFields = <T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): T => {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field as string] = encrypt(result[field] as string);
    }
  }
  return result;
};

/**
 * Decrypts an object's specified fields
 */
export const decryptFields = <T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
): T => {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        (result as Record<string, unknown>)[field as string] = decrypt(result[field] as string);
      } catch (_err) {
        // Field may not be encrypted — leave as-is
      }
    }
  }
  return result;
};

/**
 * Creates a SHA-256 hash of a string (for prescription verification)
 */
export const hashSHA256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generates a cryptographically secure random token
 */
export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};
