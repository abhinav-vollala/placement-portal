import { Rocket } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RegisterInput } from '../api/auth';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'STUDENT' | 'RECRUITER'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student fields.
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('2026');
  const [cgpa, setCgpa] = useState('');

  // Recruiter fields.
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const input: RegisterInput = { email, password, role };
    if (role === 'STUDENT') {
      input.student = {
        name,
        rollNo,
        branch,
        batch: Number(batch),
        cgpa: Number(cgpa),
      };
    } else {
      input.recruiter = { fullName, position: position || undefined, companyName };
    }

    setSubmitting(true);
    try {
      await register(input);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <aside className="gradient-brand relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Rocket className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">Placement Portal</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-extrabold leading-tight">
            Join the placement network.
          </h2>
          <p className="mt-3 max-w-sm text-indigo-100">
            Students discover opportunities; recruiters connect with talented candidates.
          </p>
        </div>
        <p className="text-xs text-indigo-200">Students · Recruiters · Placement Cell</p>
      </aside>

      {/* Form panel */}
      <main className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white">
              <Rocket className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-slate-900">Placement Portal</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold text-slate-900">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">Sign up as a student or a company recruiter.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="register-role">
                I am a
              </label>
              <select
                id="register-role"
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'STUDENT' | 'RECRUITER')}
              >
                <option value="STUDENT">Student</option>
                <option value="RECRUITER">Recruiter / Company</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="register-email">
                Email
              </label>
              <input
                id="register-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="register-password">
                Password (min 8 characters)
              </label>
              <input
                id="register-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {role === 'STUDENT' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="register-name">
                    Full name
                  </label>
                  <input
                    id="register-name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-rollno">
                    Roll number
                  </label>
                  <input
                    id="register-rollno"
                    className="input"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-branch">
                    Branch
                  </label>
                  <input
                    id="register-branch"
                    className="input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-batch">
                    Batch
                  </label>
                  <input
                    id="register-batch"
                    className="input"
                    type="number"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-cgpa">
                    CGPA (0–10)
                  </label>
                  <input
                    id="register-cgpa"
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="register-fullname">
                    Full name
                  </label>
                  <input
                    id="register-fullname"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-position">
                    Position
                  </label>
                  <input
                    id="register-position"
                    className="input"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="register-company">
                    Company name
                  </label>
                  <input
                    id="register-company"
                    className="input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
