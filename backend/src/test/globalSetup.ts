import { execSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { TEST_DATABASE_URL, TEST_UPLOAD_DIR } from './env.js';

// Runs once before the whole suite (Vitest globalSetup).
// Applies migrations to the TEST database so tests always run against the
// current schema. Requires the test database to exist (create once with):
//   docker compose exec db psql -U placement -d postgres -c "CREATE DATABASE placement_portal_test"
export default function globalSetup() {
  mkdirSync(TEST_UPLOAD_DIR, { recursive: true });
  try {
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    });
  } catch (error) {
    console.error(
      '\nFailed to prepare the test database. Create it once with:\n' +
        '  docker compose exec db psql -U placement -d postgres -c "CREATE DATABASE placement_portal_test"\n' +
        'Then re-run the tests.\n',
    );
    throw error;
  }
  // Clean up the scratch upload directory after the whole suite.
  return () => {
    rmSync(TEST_UPLOAD_DIR, { recursive: true, force: true });
  };
}
