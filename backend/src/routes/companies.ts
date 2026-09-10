import { randomBytes } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Router, type NextFunction, type Request, type Response } from 'express';
import multer, { MulterError } from 'multer';
import { z } from 'zod';
import { ApiError } from '../lib/apiError.js';
import { toDriveDirectUrl } from '../lib/driveUrl.js';
import { prisma } from '../lib/prisma.js';
import { companyLogosDir, companyLogoUrlFromFile, deletePhotoFile } from '../lib/uploads.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

// Allowed company-logo/photo image types mapped to their stored file extension.
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

// Company logos/photos are parsed in memory (bounded by the size limit),
// validated by MIME type, then written to disk; logoUrl stores the /uploads/... public path.
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
// central error handler returns a clean 400 instead of a 500. Accepts field "photo" or "logo".
function uploadPhoto(req: Request, res: Response, next: NextFunction) {
  photoUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ])(req, res, (err: unknown) => {
    if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ApiError(400, 'File is too large (max 5 MB)'));
      return;
    }
    if (!err && req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const file = files.photo?.[0] ?? files.logo?.[0];
      if (file) {
        req.file = file;
      }
    }
    next(err);
  });
}

export const companiesRouter = Router();

// Every route below requires an authenticated RECRUITER.
companiesRouter.use(authenticate, requireRole('RECRUITER'));

// All fields optional: PATCH only changes what the client sends.
// logoUrl is normalized to a direct image URL (Drive share links are converted).
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().transform(toDriveDirectUrl).optional(),
});

// GET /api/companies/me — the calling recruiter's company.
companiesRouter.get('/me', async (req, res) => {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: req.user!.userId },
    select: { companyId: true },
  });
  if (!recruiter) {
    throw new ApiError(404, 'Recruiter profile not found');
  }
  const company = await prisma.company.findUnique({ where: { id: recruiter.companyId } });
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  res.json(company);
});

// PATCH /api/companies/me — update own company details.
companiesRouter.patch('/me', async (req, res) => {
  const data = updateSchema.parse(req.body);
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: req.user!.userId },
    select: { companyId: true },
  });
  if (!recruiter) {
    throw new ApiError(404, 'Recruiter profile not found');
  }
  const company = await prisma.company.update({
    where: { id: recruiter.companyId },
    data,
  });
  res.json(company);
});

// POST /api/companies/me/logo (and /me/photo) — upload (or replace) company profile photo/logo.
companiesRouter.post(['/me/logo', '/me/photo'], uploadPhoto, async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'No photo uploaded (expected multipart field "photo" or "logo")');
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: req.user!.userId },
    select: { companyId: true },
  });
  if (!recruiter) {
    throw new ApiError(404, 'Recruiter profile not found');
  }

  const company = await prisma.company.findUnique({ where: { id: recruiter.companyId } });
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  const ext = PHOTO_EXTENSIONS[file.mimetype];
  // Random suffix avoids collisions if two uploads land in the same millisecond.
  const filename = `${company.id}-${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`;
  const absPath = join(companyLogosDir, filename);
  await writeFile(absPath, file.buffer);

  const logoUrl = companyLogoUrlFromFile(filename);
  try {
    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { logoUrl },
    });
    // Best-effort cleanup of the previous photo if it was a stored upload.
    if (company.logoUrl) {
      await deletePhotoFile(company.logoUrl);
    }
    res.status(201).json(updated);
  } catch (err) {
    // Don't leave an orphan file behind if DB write failed.
    await unlink(absPath).catch(() => undefined);
    throw err;
  }
});

// DELETE /api/companies/me/logo (and /me/photo) — remove company profile photo/logo.
companiesRouter.delete(['/me/logo', '/me/photo'], async (req, res) => {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: req.user!.userId },
    select: { companyId: true },
  });
  if (!recruiter) {
    throw new ApiError(404, 'Recruiter profile not found');
  }
  const company = await prisma.company.findUnique({ where: { id: recruiter.companyId } });
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (!company.logoUrl) {
    res.json(company);
    return;
  }
  const updated = await prisma.company.update({
    where: { id: company.id },
    data: { logoUrl: null },
  });
  await deletePhotoFile(company.logoUrl);
  res.json(updated);
});
