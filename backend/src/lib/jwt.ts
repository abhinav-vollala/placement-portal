import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/auth.js';

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    // env gives us a plain string; jsonwebtoken wants its own expiry type.
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): AuthUser {
  // We only ever sign tokens ourselves, so the payload is an AuthUser.
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}
