import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { TEST_UPLOAD_DIR } from './env.js';
import { app, createJob, makeRecruiter, makeStudent, resetDb } from './utils.js';

// Photos land in TEST_UPLOAD_DIR/student-photos (setup.ts points UPLOAD_DIR at
// the temp dir). We only assert routing/storage here — the bytes aren't decoded.
const PHOTO_DIR = join(TEST_UPLOAD_DIR, 'student-photos');

function pngBuffer(): Buffer {
  return Buffer.from('fake-png-content');
}

function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

beforeEach(async () => {
  await resetDb();
  rmSync(PHOTO_DIR, { recursive: true, force: true });
  mkdirSync(PHOTO_DIR, { recursive: true });
});

describe('profile photo upload', () => {
  it('uploads a photo and stores it on disk (201)', async () => {
    const student = await makeStudent();
    const res = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', pngBuffer(), { filename: 'me.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.photoUrl).toMatch(/^\/uploads\/student-photos\/.+\.png$/);
    const filename = res.body.photoUrl.split('/').pop();
    expect(existsSync(join(PHOTO_DIR, filename))).toBe(true);
  });

  it('rejects a non-image MIME type (400)', async () => {
    const student = await makeStudent();
    const res = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', Buffer.from('gif-bytes'), { filename: 'me.gif', contentType: 'image/gif' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JPG|PNG|WEBP/);
  });

  it('rejects a file over 5 MB (400)', async () => {
    const student = await makeStudent();
    const res = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'big.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/5 MB/);
  });

  it('rejects a request with no photo (400)', async () => {
    const student = await makeStudent();
    const res = await request(app).post('/api/students/me/photo').set(auth(student.token)).send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/No photo/);
  });

  it('forbids a recruiter from uploading (403)', async () => {
    const recruiter = await makeRecruiter();
    const res = await request(app)
      .post('/api/students/me/photo')
      .set(auth(recruiter.token))
      .attach('photo', pngBuffer(), { filename: 'me.png', contentType: 'image/png' });

    expect(res.status).toBe(403);
  });

  it('replaces the previous photo and deletes the old file', async () => {
    const student = await makeStudent();
    const first = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', pngBuffer(), { filename: 'a.png', contentType: 'image/png' });
    const oldName = first.body.photoUrl.split('/').pop();

    const second = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', pngBuffer(), { filename: 'b.png', contentType: 'image/png' });

    expect(second.status).toBe(201);
    expect(second.body.photoUrl).not.toBe(first.body.photoUrl);
    expect(existsSync(join(PHOTO_DIR, oldName))).toBe(false);
    expect(existsSync(join(PHOTO_DIR, second.body.photoUrl.split('/').pop()))).toBe(true);
  });

  it('removes the photo and deletes the file (DELETE)', async () => {
    const student = await makeStudent();
    const up = await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', pngBuffer(), { filename: 'me.png', contentType: 'image/png' });
    const filename = up.body.photoUrl.split('/').pop();

    const res = await request(app).delete('/api/students/me/photo').set(auth(student.token));

    expect(res.status).toBe(200);
    expect(res.body.photoUrl).toBeNull();
    expect(existsSync(join(PHOTO_DIR, filename))).toBe(false);
  });

  it('is idempotent when removing without a photo', async () => {
    const student = await makeStudent();
    const res = await request(app).delete('/api/students/me/photo').set(auth(student.token));

    expect(res.status).toBe(200);
    expect(res.body.photoUrl).toBeNull();
  });

  it('exposes the photo to recruiters on the applicants list', async () => {
    const recruiter = await makeRecruiter();
    const job = await createJob(recruiter.token);
    const student = await makeStudent();
    await request(app).post(`/api/jobs/${job.id}/apply`).set(auth(student.token));
    await request(app)
      .post('/api/students/me/photo')
      .set(auth(student.token))
      .attach('photo', pngBuffer(), { filename: 'me.png', contentType: 'image/png' });

    const res = await request(app)
      .get(`/api/jobs/${job.id}/applications`)
      .set(auth(recruiter.token));

    expect(res.status).toBe(200);
    expect(res.body[0].student.photoUrl).toMatch(/^\/uploads\/student-photos\/.+\.png$/);
  });
});
