import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { signToken } from '../lib/jwt.js';
import { hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma.js';
import { app, createJob, makeRecruiter, makeStudent, resetDb } from './utils.js';

beforeEach(resetDb);

// Admins have no public registration endpoint, so seed one directly.
async function makeAdmin() {
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.edu',
      passwordHash: await hashPassword('password123'),
      role: 'ADMIN',
    },
  });
  return signToken({ userId: user.id, role: 'ADMIN' });
}

describe('creating jobs', () => {
  it('lets a recruiter post a job (201)', async () => {
    const recruiter = await makeRecruiter();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send({ title: 'Backend Engineer', role: 'Fresher', ctc: 9, location: 'Mumbai', description: 'Backend role', deadline: '2030-12-31' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Backend Engineer');
  });

  it('forbids a student from posting a job (403)', async () => {
    const student = await makeStudent();
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${student.token}`)
      .send({ title: 'X', role: 'Fresher', ctc: 5, location: 'BLR', description: 'd', deadline: '2030-12-31' });
    expect(res.status).toBe(403);
  });

  it('requires authentication (401)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .send({ title: 'X', role: 'Fresher', ctc: 5, location: 'BLR', description: 'd', deadline: '2030-12-31' });
    expect(res.status).toBe(401);
  });
});

describe('browsing jobs', () => {
  it('shows a student only OPEN jobs', async () => {
    const recruiter = await makeRecruiter();
    await createJob(recruiter.token); // OPEN by default
    await createJob(recruiter.token, { status: 'CLOSED' });

    const student = await makeStudent();
    const res = await request(app).get('/api/jobs').set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('OPEN');
  });

  it('shows the admin every job regardless of status', async () => {
    const recruiter = await makeRecruiter();
    await createJob(recruiter.token);
    await createJob(recruiter.token, { status: 'CLOSED' });

    const admin = await makeAdmin();
    const res = await request(app).get('/api/jobs').set('Authorization', `Bearer ${admin}`);
    expect(res.body).toHaveLength(2);
  });
});

describe('applying to jobs', () => {
  it('lets an eligible student apply (201)', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token, { minCgpa: 7 });
    const student = await makeStudent({ cgpa: 8.5 });

    const res = await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(201);
  });

  it('rejects an ineligible student with the rule message (400)', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token, { minCgpa: 9.5 });
    const student = await makeStudent({ cgpa: 8.0 });

    const res = await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Minimum CGPA required/);
  });

  it('rejects a second application to the same job (409)', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();

    await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);
    const res = await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(409);
  });

  it('lists a student’s own applications', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();

    await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);

    const res = await request(app)
      .get('/api/applications/me')
      .set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].jobId).toBe(job.id);
  });
});

describe('applicants & ownership', () => {
  it('lets the owning recruiter see applicants', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent({ name: 'Alice' });
    await request(app).post(`/api/jobs/${job.id}/apply`).set('Authorization', `Bearer ${student.token}`);

    const res = await request(app)
      .get(`/api/jobs/${job.id}/applications`)
      .set('Authorization', `Bearer ${recruiter.token}`);
    expect(res.status).toBe(200);
    expect(res.body[0].student.name).toBe('Alice');
  });

  it('hides applicants from a different company’s recruiter (403)', async () => {
    const owner = await makeRecruiter();
    const job = await createJob(owner.token);
    const intruder = await makeRecruiter();

    const res = await request(app)
      .get(`/api/jobs/${job.id}/applications`)
      .set('Authorization', `Bearer ${intruder.token}`);
    expect(res.status).toBe(403);
  });

  it('lets only the owning recruiter update the job (403 otherwise)', async () => {
    const owner = await makeRecruiter();
    const job = await createJob(owner.token);
    const intruder = await makeRecruiter();

    const res = await request(app)
      .patch(`/api/jobs/${job.id}`)
      .set('Authorization', `Bearer ${intruder.token}`)
      .send({ title: 'Hijacked' });
    expect(res.status).toBe(403);
  });
});

describe('application status updates', () => {
  it('lets the owning recruiter move an application (200)', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();
    const apply = await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);
    const applicationId = apply.body.id;

    const res = await request(app)
      .patch(`/api/applications/${applicationId}`)
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send({ status: 'SHORTLISTED' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SHORTLISTED');
  });

  it('forbids a student from changing status (403)', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();
    const apply = await request(app)
      .post(`/api/jobs/${job.id}/apply`)
      .set('Authorization', `Bearer ${student.token}`);

    const res = await request(app)
      .patch(`/api/applications/${apply.body.id}`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ status: 'SELECTED' });
    expect(res.status).toBe(403);
  });
});

describe('admin overview', () => {
  it('returns accurate stats', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();
    await request(app).post(`/api/jobs/${job.id}/apply`).set('Authorization', `Bearer ${student.token}`);

    const admin = await makeAdmin();
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${admin}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ students: 1, recruiters: 1, companies: 1, jobs: 1, applications: 1 });
  });

  it('forbids non-admins from the admin endpoints (403)', async () => {
    const student = await makeStudent();
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(403);
  });
});
