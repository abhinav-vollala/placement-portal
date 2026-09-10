// Small display helpers shared across pages.

// Google Drive share links (…/file/d/<id>/view or …/open?id=<id>) are HTML
// pages, not raw files, so they can't be used directly as an <img> src. This
// converts them to the "preview/download" URL form, which serves the file:
//   https://drive.google.com/uc?export=view&id=<id>
// Non-Drive URLs are returned unchanged.
const DRIVE_FILE_RE = /\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_ID_QUERY_RE = /[?&]id=([a-zA-Z0-9_-]+)/;

export function toDriveDirectUrl(url: string): string {
  const match = url.match(DRIVE_FILE_RE) ?? url.match(DRIVE_ID_QUERY_RE);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : url;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Derive "current year of study" from the admission batch.
export function yearOfStudy(batch: number): string {
  const year = new Date().getFullYear() - batch + 1;
  if (year <= 1) return '1st Year';
  if (year === 2) return '2nd Year';
  if (year === 3) return '3rd Year';
  if (year === 4) return '4th Year';
  return 'Alumni';
}
