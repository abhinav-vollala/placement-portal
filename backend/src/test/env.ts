// Test-only configuration. Imported by the Vitest config and global setup,
// so it must NOT import app modules (env.ts would exit without DATABASE_URL).
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const TEST_DATABASE_URL =
  'postgresql://placement:placement@localhost:5432/placement_portal_test';

export const TEST_JWT_SECRET = 'test-secret-that-is-long-enough-123456';

// Scratch directory for uploaded photos, so tests never touch the dev uploads.
export const TEST_UPLOAD_DIR = join(tmpdir(), 'placement-portal-test-uploads');
