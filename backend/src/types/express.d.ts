import type { AuthUser } from './auth.js';

// Tell TypeScript that Express Request has an optional `user` field,
// populated by the authenticate middleware.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
