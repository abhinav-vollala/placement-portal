import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Router, type NextFunction, type Request, type Response } from 'express';
import multer, { MulterError } from 'multer';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { prisma } from '../lib/prisma.js';
import { deletePhotoFile, photoUrlFromFile, studentPhotosDir } from '../lib/uploads.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

// Allowed profile-photo image types mapped to their stored file extension.
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

// Profile photos are parsed in memory (bounded by the size limit), validated by
// MIME type, then written to disk; photoUrl stores the /uploads/... public path.
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!(file.mimetype in PHOTO_EXTENSIONS)) {
      cb(new ApiError(400, 'Only JPG, PNG or WEBP images are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Run the multer middleware, translating its errors into ApiError so the
// central error handler returns a clean 400 instead of a 500.
function uploadPhoto(req: Request, res: Response, next: NextFunction) {
  photoUpload.single('photo')(req, res, (err: unknown) => {
    if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(400, 'File is too large (max 5 MB)'));
      return;
    }
    next(err);
  });
}

export const studentsRouter = Router();

// Every route below requires an authenticated STUDENT.
studentsRouter.use(authenticate, requireRole('STUDENT'));

// All fields optional: PATCH only changes what the client sends.
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  branch: z.string().optional(),
  batch: z.number().int().min(2000).max(2100).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  backlogs: z.number().int().min(0).optional(),
});

// GET /api/students/me — the caller's own profile.
studentsRouter.get('/me', async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user!.userId },
    include: { user: { select: { email: true } } },
  });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }
  res.json(student);
});

// PATCH /api/students/me — update own profile.
studentsRouter.patch('/me', async (req, res) => {
  const data = updateSchema.parse(req.body);
  const student = await prisma.student.update({
    where: { userId: req.user!.userId },
    data,
  });
  res.json(student);
});

// POST /api/students/me/photo — upload (or replace) the profile photo.
studentsRouter.post('/me/photo', uploadPhoto, async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'No photo uploaded (expected multipart field "photo")');
  }

  const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }

  const ext = PHOTO_EXTENSIONS[file.mimetype];
  // Random suffix avoids collisions if two uploads land in the same millisecond.
  const filename = `${student.id}-${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
  const absPath = join(studentPhotosDir, filename);
  await writeFile(absPath, file.buffer);

  const photoUrl = photoUrlFromFile(filename);
  try {
    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { photoUrl },
    });
    // Best-effort cleanup of the previous photo, only once the new one is live.
    if (student.photoUrl) {
      await deletePhotoFile(student.photoUrl);
    }
    res.status(201).json(updated);
  } catch (err) {
    // Don't leave an orphan file behind if the DB write failed.
    await unlink(absPath).catch(() => undefined);
    throw err;
  }
});

// DELETE /api/students/me/photo — remove the profile photo (idempotent).
studentsRouter.delete('/me/photo', async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user!.userId } });
  if (!student) {
    throw new ApiError(404, 'Student profile not found');
  }
  if (!student.photoUrl) {
    res.json(student);
    return;
  }
  // Clear the reference first so the DB never points at a deleted file.
  const updated = await prisma.student.update({
    where: { id: student.id },
    data: { photoUrl: null },
  });
  await deletePhotoFile(student.photoUrl);
  res.json(updated);
});
