import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { TEST_UPLOAD_DIR } from './env.js';
import { app, makeRecruiter, resetDb } from './utils.js';

// Company logos land in TEST_UPLOAD_DIR/company-logos
const LOGO_DIR = join(TEST_UPLOAD_DIR, 'company-logos');

function pngBuffer(): Buffer {
  return Buffer.from('fake-png-content');
}

function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

beforeEach(async () => {
  await resetDb();
  rmSync(LOGO_DIR, { recursive: true, force: true });
  mkdirSync(LOGO_DIR, { recursive: true });
});

describe('company logo/photo upload', () => {
  it('uploads a logo and stores it on disk (201)', async () => {
    const recruiter = await makeRecruiter();
    const res = await request(app)
      .post('/api/companies/me/logo')
      .set(auth(recruiter.token))
      .attach('photo', pngBuffer(), { filename: 'company.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.logoUrl).toMatch(/^\/uploads\/company-logos\/.+\.png$/);
    const filename = res.body.logoUrl.split('/').pop();
    expect(existsSync(join(LOGO_DIR, filename))).toBe(true);
  });

  it('rejects a non-image MIME type (400)', async () => {
    const recruiter = await makeRecruiter();
    const res = await request(app)
      .post('/api/companies/me/logo')
      .set(auth(recruiter.token))
      .attach('photo', Buffer.from('gif-bytes'), { filename: 'me.gif', contentType: 'image/gif' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JPG|PNG|WEBP/);
  });

  it('rejects files larger than 5 MB (400)', async () => {
    const recruiter = await makeRecruiter();
    const res = await request(app)
      .post('/api/companies/me/logo')
      .set(auth(recruiter.token))
      .attach('photo', Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: 'huge.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/too large/);
  });

  it('removes the logo and deletes the file (DELETE)', async () => {
    const recruiter = await makeRecruiter();
    const up = await request(app)
      .post('/api/companies/me/logo')
      .set(auth(recruiter.token))
      .attach('photo', pngBuffer(), { filename: 'logo.png', contentType: 'image/png' });
    const filename = up.body.logoUrl.split('/').pop();

    const res = await request(app).delete('/api/companies/me/logo').set(auth(recruiter.token));
    expect(res.status).toBe(200);
    expect(res.body.logoUrl).toBeNull();
    expect(existsSync(join(LOGO_DIR, filename))).toBe(false);
  });
});
