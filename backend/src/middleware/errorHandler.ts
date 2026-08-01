import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../lib/apiError.js';
import { Prisma } from '../generated/prisma/client.js';

// Central error handler. Express detects it by its 4-argument signature and
// routes every thrown error (or next(err) call) here.
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  void req;
  void next;

  // Known application errors (401/403/404/409...) with an explicit status.
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // Prisma database errors: unique violation -> 409, record not found -> 404.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ message: 'A record with those details already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Record not found' });
      return;
    }
  }

  // Zod validation errors -> 400 with field-level details.
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development'
      ? { details: err instanceof Error ? err.message : String(err) }
      : {}),
  });
}