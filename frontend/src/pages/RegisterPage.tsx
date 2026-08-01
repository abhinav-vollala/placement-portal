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
    <div className="auth-page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          I am a
          <select value={role} onChange={(e) => setRole(e.target.value as 'STUDENT' | 'RECRUITER')}>
            <option value="STUDENT">Student</option>
            <option value="RECRUITER">Recruiter / Company</option>
          </select>
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password (min 8 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {role === 'STUDENT' ? (
          <>
            <label>
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Roll number
              <input value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
            </label>
            <label>
              Branch
              <input value={branch} onChange={(e) => setBranch(e.target.value)} required />
            </label>
            <label>
              Batch
              <input type="number" value={batch} onChange={(e) => setBatch(e.target.value)} required />
            </label>
            <label>
              CGPA (0–10)
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              Position
              <input value={position} onChange={(e) => setPosition(e.target.value)} />
            </label>
            <label>
              Company name
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </label>
          </>
        )}

        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
