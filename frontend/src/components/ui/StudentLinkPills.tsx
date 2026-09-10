import { ExternalLink } from 'lucide-react';
import { CvResumeIcon, LinkedInIcon, GitHubIcon } from './BrandIcons';

// Compact Resume / LinkedIn / GitHub link pills for a student, used on the
// recruiter's applicant detail and shortlisted pages. Missing links render a
// muted dashed placeholder.
export function StudentLinkPills({
  student,
}: {
  student: {
    resumeUrl?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
  };
}) {
  const items = [
    {
      label: 'Resume',
      icon: CvResumeIcon,
      url: student.resumeUrl,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'LinkedIn',
      icon: LinkedInIcon,
      url: student.linkedinUrl,
      iconColor: 'text-[#0A66C2] dark:text-sky-400',
    },
    {
      label: 'GitHub',
      icon: GitHubIcon,
      url: student.githubUrl,
      iconColor: 'text-slate-800 dark:text-slate-200',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, icon: Icon, url, iconColor }) =>
        url ? (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
          >
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
            {label}
            <ExternalLink className="h-3 w-3 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400" />
          </a>
        ) : (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-400 dark:border-[#262e3d] dark:bg-[#121620] dark:text-slate-500"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ),
      )}
    </div>
  );
}
