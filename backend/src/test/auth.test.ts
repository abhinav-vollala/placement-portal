import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, resetDb } from './utils.js';

beforeEach(resetDb);

describe('POST /api/auth/register', () => {
  it('creates a student account with 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'alice@test.edu',
      password: 'password123',
      role: 'STUDENT',
      student: { name: 'Alice', rollNo: 'CS-001', branch: 'CSE', batch: 2026, cgpa: 8.5 },
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: 'alice@test.edu', role: 'STUDENT' });
  });

  it('rejects a duplicate email with 409', async () => {
    const payload = {
      email: 'alice@test.edu',
      password: 'password123',
      role: 'STUDENT',
      student: { name: 'Alice', rollNo: 'CS-001', branch: 'CSE', batch: 2026, cgpa: 8.5 },
    };
    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/);
  });

  it('requires a student profile for the STUDENT role (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.edu', password: 'password123', role: 'STUDENT' });
    expect(res.status).toBe(400);
    expect(res.body.errors?.student).toBeDefined();
  });

  it('requires a recruiter profile for the RECRUITER role (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.edu', password: 'password123', role: 'RECRUITER' });
    expect(res.status).toBe(400);
    expect(res.body.errors?.recruiter).toBeDefined();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@test.edu', password: 'short', role: 'STUDENT', student: { name: 'A', rollNo: 'R', branch: 'CSE', batch: 2026, cgpa: 8 } });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alice@test.edu',
      password: 'password123',
      role: 'STUDENT',
      student: { name: 'Alice', rollNo: 'CS-001', branch: 'CSE', batch: 2026, cgpa: 8.5 },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.edu', password: 'password123' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.role).toBe('STUDENT');
  });

  it('rejects a wrong password with 401', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alice@test.edu',
      password: 'password123',
      role: 'STUDENT',
      student: { name: 'Alice', rollNo: 'CS-001', branch: 'CSE', batch: 2026, cgpa: 8.5 },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.edu', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email with 401 (same message)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.edu', password: 'password123' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user when authenticated', async () => {
    const register = await request(app).post('/api/auth/register').send({
      email: 'alice@test.edu',
      password: 'password123',
      role: 'STUDENT',
      student: { name: 'Alice', rollNo: 'CS-001', branch: 'CSE', batch: 2026, cgpa: 8.5 },
    });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.edu', password: 'password123' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(register.body.id);
  });

  it('rejects a missing token with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token with 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(401);
  });
});
