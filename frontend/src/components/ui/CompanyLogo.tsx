import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { toDriveDirectUrl } from '../../lib/format';

// Company logo tile for job cards. Shows the logo image when the company has
// one set, otherwise falls back to the brand gradient + building icon.
// If the image fails to load (broken link), the same fallback takes over.
export function CompanyLogo({
  name,
  logoUrl,
}: {
  name?: string | null;
  logoUrl?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-[#262e3d]">
        <img
          src={toDriveDirectUrl(logoUrl)}
          alt={`${name ?? 'Company'} logo`}
          onError={() => setFailed(true)}
          className="h-full w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl gradient-brand text-white shadow-sm">
      <Building2 className="h-6 w-6" />
    </div>
  );
}
