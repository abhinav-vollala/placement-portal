# College Placement Portal

A placement portal where **students** apply to company job offers, **recruiters** post and manage jobs and review applicants, and **admins** oversee the entire flow. Built as a production-quality full-stack application: TypeScript end-to-end, PostgreSQL (Neon Cloud / Local) with type-safe migrations, role-based JWT authentication, and CI/CD.

## Features

- **Authentication & roles** — JWT-based auth with role-based access control: `STUDENT`, `RECRUITER`, `ADMIN`.
- **Students** — browse open jobs, apply (with automatic eligibility checks), track application status.
- **Recruiters** — post and manage jobs for their company, review applicants, move them through the pipeline (`APPLIED → SHORTLISTED → SELECTED/REJECTED`).
- **Admins** — dashboard with live stats, student roster, and company overview.
- **Eligibility engine** — server-enforced rules: minimum CGPA, maximum backlogs, allowed branches, open status, deadline.
- **Cloud Database** — 100% cloud-ready with Neon Serverless PostgreSQL (0 local software installation required).

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Componentized UI; Vite for fast dev/build; TS for compile-time safety |
| Backend | Node.js + Express + TypeScript | One language across the stack; minimal, battle-tested framework |
| Database | PostgreSQL (Neon Cloud / Local) | Relational data with strict integrity (unique apply, cascades) |
| ORM | Prisma | Schema-as-code + versioned migrations + generated types |
| Validation | Zod | Runtime validation at the API boundary |
| Auth | JWT + bcrypt | Stateless auth; hashed passwords |
| CI/CD | GitHub Actions | Lint, typecheck, build, and tests on every push |
| Tests | Vitest + Supertest + Testing Library | Backend integration tests; frontend component tests |

## Architecture

```
Browser ──▶ React Frontend (:5173) ──▶ Express Backend (:4000) ──▶ PostgreSQL (Neon DB)
```

In development, Vite's proxy forwards `/api` requests to the Express backend (`:4000`), which communicates directly with your PostgreSQL database.

## Repository Structure

```
placement-portal/
├── backend/                 # Express + Prisma + TypeScript API
│   ├── prisma/              # schema.prisma, migrations, seed
│   └── src/
│       ├── config/          # validated environment configuration
│       ├── lib/             # prisma, jwt, password, apiError, uploads
│       ├── middleware/      # authenticate, authorize, errorHandler
│       ├── routes/          # auth, students, jobs, applications, admin, companies
│       ├── services/        # eligibility rules (pure functions)
│       └── test/            # integration tests + test utilities
├── frontend/                # React + Vite + TypeScript web app
│   └── src/
│       ├── api/             # typed API client per domain
│       ├── auth/            # session context + route guards
│       ├── components/      # shared UI (layout, badges, cards)
│       ├── pages/           # dashboards and flows per role
│       └── theme/           # dark/light mode context
└── .github/workflows/       # CI pipeline
```

## Getting Started

### Prerequisites

- **Node.js 20+** and **npm**
- **PostgreSQL Database URL** (e.g. Free [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com))

---

### Quick Start (Development)

#### 1. Setup Backend
```bash
cd backend
cp .env.example .env          # paste your Neon DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # seed demo accounts & jobs
npm run dev                   # API running on http://localhost:4000
```

#### 2. Setup Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev                   # Web app running on http://localhost:5173
```

Open **http://localhost:5173** in your browser!

---

### Demo Accounts (after `npm run db:seed`)

| Role | Email | Password |
| --- | --- | --- |
| Student (CSE) | `alice@college.edu` | `secret123` |
| Student (IT, low CGPA) | `bob@college.edu` | `secret123` |
| Recruiter (Acme Corp) | `bob@acme.com` | `secret123` |
| Recruiter (Globex Corp) | `jane@globex.com` | `secret123` |
| Admin | `admin@portal.com` | `admin123` |

---

## Testing

Run unit and integration tests:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

---

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:

- **Backend** — install, generate Prisma client, typecheck, lint, build, integration tests.
- **Frontend** — install, typecheck, lint, build, component tests.

---

## API Overview

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | public | Create a student or recruiter account |
| `POST` | `/api/auth/login` | public | Authenticate, get a JWT |
| `GET` | `/api/auth/me` | any auth | Current user info |
| `GET/PATCH` | `/api/students/me` | student | View / update own profile & photo |
| `GET` | `/api/jobs` | any auth | Browse jobs (students see OPEN only) |
| `POST` | `/api/jobs` | recruiter | Post a job |
| `GET` | `/api/jobs/mine` | recruiter/admin | Own company's jobs |
| `GET/PATCH/DELETE` | `/api/jobs/:id` | owner/admin | Manage a job |
| `POST` | `/api/jobs/:id/apply` | student | Apply (eligibility-checked) |
| `GET` | `/api/jobs/:id/applications` | owner/admin | Applicants for a job |
| `GET` | `/api/applications/me` | student | Own applications |
| `GET` | `/api/applications` | admin | All applications |
| `PATCH` | `/api/applications/:id` | owner/admin | Update application status |
| `GET/POST` | `/api/companies` | recruiter/admin | Company details & logo upload |
| `GET` | `/api/admin/*` | admin | Stats, students, companies |

