// Boots the HTTP server. The Express app itself lives in app.ts so it can be
// tested without binding to a port.

import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

// Graceful shutdown: stop accepting requests, finish in-flight ones, then
// close the database connection.
function shutdown(signal: string) {
  console.log(`${signal} received - shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
