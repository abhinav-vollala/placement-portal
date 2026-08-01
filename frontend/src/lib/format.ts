// Small display helpers shared across pages.

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
