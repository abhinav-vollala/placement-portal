import { mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { isAbsolute, join, posix, relative, resolve } from 'node:path';
import { env } from '../config/env.js';

// Root of uploaded files (student profile photos). Resolved once at startup so
// the app serves and writes to a single directory for the whole process. In
// tests the path is overridden via UPLOAD_DIR before this module is imported.
export const uploadsDir = resolve(process.cwd(), env.UPLOAD_DIR);

// Subdirectory below uploadsDir that holds student profile photos.
export const studentPhotosDir = join(uploadsDir, 'student-photos');
// Subdirectory below uploadsDir that holds company logos/photos.
export const companyLogosDir = join(uploadsDir, 'company-logos');

// Make sure the upload directories exist. Called from createApp() so static
// serving and writes never race a missing directory.
export function ensureUploadsDir(): void {
  mkdirSync(studentPhotosDir, { recursive: true });
  mkdirSync(companyLogosDir, { recursive: true });
}

// Public URL path for a stored photo filename. Built with path.posix so the
// value uses forward slashes and works as a URL on any OS (path.join would
// produce backslashes on Windows). The leading slash makes it an absolute,
// origin-relative URL so <img src="/uploads/..."> works from any route.
export function photoUrlFromFile(filename: string): string {
  return posix.join('/uploads', 'student-photos', filename);
}

export function companyLogoUrlFromFile(filename: string): string {
  return posix.join('/uploads', 'company-logos', filename);
}

// Delete a stored photo by its public URL path (e.g. "/uploads/student-photos/x.jpg").
// The resolved path must stay inside uploadsDir — defense against a malicious
// or corrupted photoUrl escaping the upload root. Missing files are a no-op.
export async function deletePhotoFile(urlPath: string): Promise<void> {
  const rel = urlPath.startsWith('/uploads/') ? urlPath.slice('/uploads/'.length) : urlPath;
  const abs = resolve(uploadsDir, rel);
  const relPath = relative(uploadsDir, abs);
  if (relPath === '' || relPath.startsWith('..') || isAbsolute(relPath)) {
    return;
  }
  await rm(abs, { force: true });
}
