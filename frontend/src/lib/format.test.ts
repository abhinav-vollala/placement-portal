import { describe, expect, it } from 'vitest';
import { toDriveDirectUrl } from './format';

describe('toDriveDirectUrl', () => {
  it('converts a /file/d/<id>/view share link to the raw file URL', () => {
    expect(toDriveDirectUrl('https://drive.google.com/file/d/abc123DEF-xyz/view')).toBe(
      'https://drive.google.com/uc?export=view&id=abc123DEF-xyz',
    );
  });

  it('drops query params such as ?usp=sharing', () => {
    expect(toDriveDirectUrl('https://drive.google.com/file/d/abc123/view?usp=drive_link')).toBe(
      'https://drive.google.com/uc?export=view&id=abc123',
    );
  });

  it('converts the /open?id=<id> form', () => {
    expect(toDriveDirectUrl('https://drive.google.com/open?id=abc123')).toBe(
      'https://drive.google.com/uc?export=view&id=abc123',
    );
  });

  it('leaves non-Drive URLs untouched', () => {
    expect(toDriveDirectUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
    expect(toDriveDirectUrl('https://ui-avatars.com/api/?name=Acme&background=4f46e5')).toBe(
      'https://ui-avatars.com/api/?name=Acme&background=4f46e5',
    );
  });
});
