import { execSync } from 'node:child_process';
import { TEST_DATABASE_URL } from './env.js';

// Runs once before the whole suite (Vitest globalSetup).
// Applies migrations to the TEST database so tests always run against the
// current schema. Requires the test database to exist (create once with):
//   docker compose exec db psql -U placement -d postgres -c "CREATE DATABASE placement_portal_test"
export default function globalSetup() {
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
}
