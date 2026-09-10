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
