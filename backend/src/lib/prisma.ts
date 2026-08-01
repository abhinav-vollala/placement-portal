import { PrismaClient } from '../generated/prisma/client.js';

// One PrismaClient shared by the whole app. Recreating it on every import
// would exhaust the database connection pool.
// `tsx watch` restarts the process on file changes without resetting globals,
// so in development we reuse the existing client instead of leaking new ones.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
