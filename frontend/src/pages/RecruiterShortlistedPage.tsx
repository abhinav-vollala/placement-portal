import { ChevronRight, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import { fetchJobApplications, fetchMyJobs, type Application } from '../api/jobs';
import { StatusBadge } from '../components/StatusBadge';
import { CvResumeIcon, LinkedInIcon, GitHubIcon } from '../components/ui/BrandIcons';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Spinner } from '../components/ui/Spinner';
import { StudentAvatar } from '../components/ui/StudentAvatar';

// ─── Component ────────────────────────────────────────────────────────────────

export function RecruiterShortlistedPage() {
  const [shortlisted, setShortlisted] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const jobs = await fetchMyJobs();
      const all = await Promise.all(
        jobs.map(async (job) => {
          const apps = await fetchJobApplications(job.id);
          return apps.map((app) => ({ ...app, job: app.job ?? job }));
        }),
      );
      setShortlisted(all.flat().filter((a) => a.status === 'SHORTLISTED'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load shortlisted applicants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <Spinner label="Loading shortlisted candidates…" />;
  }

  return (
    <div>
      <PageHeader
        title="Shortlisted Candidates"
        subtitle="Review all candidates currently shortlisted across your job postings."
      />

      {error && <p className="form-error mb-6">{error}</p>}

      {shortlisted.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No shortlisted candidates"
          subtitle="When you shortlist a candidate from the applicants list, they will appear here."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Resume</th>
                  <th className="px-4 py-3">LinkedIn</th>
                  <th className="px-4 py-3">GitHub</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortlisted.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-[#1a202c] transition-colors duration-150">
                    {/* Student */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/my-jobs/applicants/${app.id}`}
                        className="flex items-center gap-3 transition-opacity hover:opacity-75"
                      >
                        <StudentAvatar
                          photoUrl={app.student?.photoUrl}
                          className="h-9 w-9 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {app.student?.name ?? 'Unknown'}
                          </p>
                          {app.student?.rollNo && (
                            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{app.student.rollNo}</p>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Job */}
                    <td className="px-4 py-3">
                      <p className="max-w-[200px] truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {app.job?.title ?? '—'}
                      </p>
                    </td>

                    {/* Resume */}
                    <td className="px-4 py-3">
                      {app.student?.resumeUrl ? (
                        <a
                          href={app.student.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Resume / CV"
                          className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                        >
                          <CvResumeIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>

                    {/* LinkedIn */}
                    <td className="px-4 py-3">
                      {app.student?.linkedinUrl ? (
                        <a
                          href={app.student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View LinkedIn Profile"
                          className="inline-flex items-center justify-center rounded-lg border border-sky-200 bg-sky-50 p-1.5 text-[#0A66C2] shadow-sm transition hover:border-[#0A66C2]/40 hover:bg-sky-100 hover:text-[#004182] dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-[#388bfd] dark:hover:bg-sky-900/60"
                        >
                          <LinkedInIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>

                    {/* GitHub */}
                    <td className="px-4 py-3">
                      {app.student?.githubUrl ? (
                        <a
                          href={app.student.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View GitHub Profile"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-slate-100 p-1.5 text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-200 hover:text-black dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <GitHubIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>

                    {/* Status (Read-Only) */}
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/my-jobs/applicants/${app.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-[#262e3d] dark:bg-[#1a202c] dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                      >
                        View
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
