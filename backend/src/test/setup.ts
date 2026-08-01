// Runs before every test file. Sets env vars BEFORE any app module is imported;
// dotenv never overrides already-set variables, so these win over backend/.env.
import { TEST_DATABASE_URL, TEST_JWT_SECRET } from './env.js';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = TEST_JWT_SECRET;

export {};
