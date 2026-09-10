import type { EmploymentType, JobStatus, WorkMode, Job, CreateJobInput } from '../../api/jobs';
import { employmentTypeLabels, workModeLabels } from '../../lib/jobLabels';

// The full set of job form values, string-based so inputs can bind directly.
export interface JobFormValues {
  title: string;
  role: string;
  ctc: string;
  location: string;
  description: string;
  minCgpa: string;
  maxBacklogs: string;
  allowedBranches: string;
  deadline: string; // YYYY-MM-DD for <input type="date">
  status: JobStatus;
  employmentType: EmploymentType;
  openings: string;
  eligibleBatch: string;
  responsibilities: string;
  requirements: string;
  preferredSkills: string;
  experience: string;
  duration: string;
  workMode: WorkMode;
}

export const emptyJobForm: JobFormValues = {
  title: '',
  role: '',
  ctc: '',
  location: '',
  description: '',
  minCgpa: '',
  maxBacklogs: '',
  allowedBranches: '',
  deadline: '',
  status: 'OPEN',
  employmentType: 'FULL_TIME',
  openings: '',
  eligibleBatch: '',
  responsibilities: '',
  requirements: '',
  preferredSkills: '',
  experience: '',
  duration: '',
  workMode: 'ONSITE',
};

// Convert a fetched Job into form values so edit forms start pre-filled.
export function jobToForm(job: Job): JobFormValues {
  return {
    title: job.title,
    role: job.role,
    ctc: job.ctc,
    location: job.location,
    description: job.description,
    minCgpa: job.minCgpa,
    maxBacklogs: String(job.maxBacklogs),
    allowedBranches: job.allowedBranches.join(', '),
    deadline: job.deadline.slice(0, 10),
    status: job.status,
    employmentType: job.employmentType ?? 'FULL_TIME',
    openings: job.openings != null ? String(job.openings) : '1',
    eligibleBatch: job.eligibleBatch ?? '',
    responsibilities: job.responsibilities ?? '',
    requirements: job.requirements ?? '',
    preferredSkills: job.preferredSkills ?? '',
    experience: job.experience ?? '',
    duration: job.duration ?? '',
    workMode: job.workMode ?? 'ONSITE',
  };
}

// Build the CreateJobInput payload for create/update from form values.
export function buildJobInput(form: JobFormValues): CreateJobInput {
  return {
    title: form.title,
    role: form.role,
    ctc: Number(form.ctc),
    location: form.location,
    description: form.description,
    minCgpa: form.minCgpa ? Number(form.minCgpa) : 0,
    maxBacklogs: form.maxBacklogs ? Number(form.maxBacklogs) : 0,
    allowedBranches: form.allowedBranches
      ? form.allowedBranches
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean)
      : [],
    deadline: new Date(form.deadline).toISOString(),
    status: form.status,
    employmentType: form.employmentType,
    openings: form.openings ? Number(form.openings) : 1,
    eligibleBatch: form.eligibleBatch.trim() || undefined,
    responsibilities: form.responsibilities.trim() || undefined,
    requirements: form.requirements.trim() || undefined,
    preferredSkills: form.preferredSkills.trim() || undefined,
    experience: form.experience.trim() || undefined,
    duration: form.duration.trim() || undefined,
    workMode: form.workMode,
  };
}

// Shared grid of job fields for the create and edit forms. Each input gets a
// unique id derived from `idPrefix` so forms can live on the same page.
export function JobFormFields({
  form,
  set,
  idPrefix,
}: {
  form: JobFormValues;
  set: (field: keyof JobFormValues, value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <label className="label" htmlFor={`${idPrefix}-title`}>
          Title
        </label>
        <input
          id={`${idPrefix}-title`}
          className="input"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          placeholder="Software Engineer"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-role`}>
          Role / Level
        </label>
        <input
          id={`${idPrefix}-role`}
          className="input"
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          required
          placeholder="Fresher, Intern, Senior…"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-ctc`}>
          CTC (LPA)
        </label>
        <input
          id={`${idPrefix}-ctc`}
          className="input"
          type="number"
          step="0.01"
          min="0"
          value={form.ctc}
          onChange={(e) => set('ctc', e.target.value)}
          required
          placeholder="6.5"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-location`}>
          Location
        </label>
        <input
          id={`${idPrefix}-location`}
          className="input"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          required
          placeholder="Bengaluru"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-employment-type`}>
          Employment Type
        </label>
        <select
          id={`${idPrefix}-employment-type`}
          className="input"
          value={form.employmentType}
          onChange={(e) => set('employmentType', e.target.value as EmploymentType)}
        >
          {(Object.keys(employmentTypeLabels) as EmploymentType[]).map((type) => (
            <option key={type} value={type}>
              {employmentTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-openings`}>
          Number of Openings
        </label>
        <input
          id={`${idPrefix}-openings`}
          className="input"
          type="number"
          min="1"
          value={form.openings}
          onChange={(e) => set('openings', e.target.value)}
          placeholder="1"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-work-mode`}>
          Work Mode
        </label>
        <select
          id={`${idPrefix}-work-mode`}
          className="input"
          value={form.workMode}
          onChange={(e) => set('workMode', e.target.value as WorkMode)}
        >
          {(Object.keys(workModeLabels) as WorkMode[]).map((mode) => (
            <option key={mode} value={mode}>
              {workModeLabels[mode]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-deadline`}>
          Application Deadline
        </label>
        <input
          id={`${idPrefix}-deadline`}
          className="input"
          type="date"
          value={form.deadline}
          onChange={(e) => set('deadline', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-status`}>
          Status
        </label>
        <select
          id={`${idPrefix}-status`}
          className="input"
          value={form.status}
          onChange={(e) => set('status', e.target.value as JobStatus)}
        >
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-min-cgpa`}>
          Minimum CGPA
        </label>
        <input
          id={`${idPrefix}-min-cgpa`}
          className="input"
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={form.minCgpa}
          onChange={(e) => set('minCgpa', e.target.value)}
          placeholder="6.5"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-max-backlogs`}>
          Max Backlogs
        </label>
        <input
          id={`${idPrefix}-max-backlogs`}
          className="input"
          type="number"
          min="0"
          value={form.maxBacklogs}
          onChange={(e) => set('maxBacklogs', e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-eligible-batch`}>
          Eligible Batch
        </label>
        <input
          id={`${idPrefix}-eligible-batch`}
          className="input"
          value={form.eligibleBatch}
          onChange={(e) => set('eligibleBatch', e.target.value)}
          placeholder="2026, 2027"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`${idPrefix}-branches`}>
          Eligible Branches (comma separated)
        </label>
        <input
          id={`${idPrefix}-branches`}
          className="input"
          value={form.allowedBranches}
          onChange={(e) => set('allowedBranches', e.target.value)}
          placeholder="CSE, IT, ECE"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-experience`}>
          Experience Required
        </label>
        <input
          id={`${idPrefix}-experience`}
          className="input"
          value={form.experience}
          onChange={(e) => set('experience', e.target.value)}
          placeholder="Fresher, 0-2 years…"
        />
      </div>
      <div>
        <label className="label" htmlFor={`${idPrefix}-duration`}>
          Duration
        </label>
        <input
          id={`${idPrefix}-duration`}
          className="input"
          value={form.duration}
          onChange={(e) => set('duration', e.target.value)}
          placeholder="Full-time, 6 months…"
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label" htmlFor={`${idPrefix}-description`}>
          Job Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          className="input min-h-24"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          placeholder="Tell students about the role…"
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label" htmlFor={`${idPrefix}-responsibilities`}>
          Responsibilities (one per line)
        </label>
        <textarea
          id={`${idPrefix}-responsibilities`}
          className="input min-h-20"
          value={form.responsibilities}
          onChange={(e) => set('responsibilities', e.target.value)}
          placeholder={'Build and ship features…\nCollaborate with the team…'}
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label" htmlFor={`${idPrefix}-requirements`}>
          Requirements (one per line)
        </label>
        <textarea
          id={`${idPrefix}-requirements`}
          className="input min-h-20"
          value={form.requirements}
          onChange={(e) => set('requirements', e.target.value)}
          placeholder={'B.Tech in CSE or IT…\nStrong problem-solving skills…'}
        />
      </div>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="label" htmlFor={`${idPrefix}-skills`}>
          Preferred Skills (comma separated)
        </label>
        <input
          id={`${idPrefix}-skills`}
          className="input"
          value={form.preferredSkills}
          onChange={(e) => set('preferredSkills', e.target.value)}
          placeholder="React, TypeScript, Git"
        />
      </div>
    </div>
  );
}
