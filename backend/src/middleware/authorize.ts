import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/apiError.js';
import type { Role } from '../types/auth.js';

// Authorization: a factory that returns a middleware allowing only the given roles.
// Usage: router.get('/', authenticate, requireRole('ADMIN'), handler)
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }
    next();
  };
}
