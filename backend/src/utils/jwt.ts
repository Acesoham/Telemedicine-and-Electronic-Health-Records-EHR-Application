import jwt from 'jsonwebtoken';
import { config } from '../configs/config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Signs a JWT access token (short-lived: 15m)
 */
export const signAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'medivault-api',
    audience: 'medivault-client',
  } as jwt.SignOptions);
};

/**
 * Signs a JWT refresh token (long-lived: 7d)
 */
export const signRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'medivault-api',
    audience: 'medivault-client',
  } as jwt.SignOptions);
};

/**
 * Generates both access and refresh tokens
 */
export const generateTokenPair = (payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair => {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

/**
 * Verifies an access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'medivault-api',
    audience: 'medivault-client',
  }) as JwtPayload;
};

/**
 * Verifies a refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'medivault-api',
    audience: 'medivault-client',
  }) as JwtPayload;
};

/**
 * Decodes a token without verification (for logging purposes only)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};
