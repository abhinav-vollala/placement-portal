import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/apiError.js';
import { verifyToken } from '../lib/jwt.js';

// Authentication: extracts a Bearer token, verifies it, attaches claims to
// req.user. Runs before any protected route.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    // Same message for missing/invalid/expired — don't leak details.
    throw new ApiError(401, 'Invalid or expired token');
  }
}
