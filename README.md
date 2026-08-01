# College Placement Portal

A placement portal where **students** apply to company job offers, **recruiters** post and manage jobs and review applicants, and **admins** oversee the entire flow. Built as a production-quality full-stack application: TypeScript end-to-end, PostgreSQL with type-safe migrations, Docker + Nginx deployment, and CI/CD.

## Features

- **Authentication & roles** — JWT-based auth with role-based access control: `STUDENT`, `RECRUITER`, `ADMIN`.
- **Students** — browse open jobs, apply (with automatic eligibility checks), track application status.
- **Recruiters** — post and manage jobs for their company, review applicants, move them through the pipeline (`APPLIED → SHORTLISTED → SELECTED/REJECTED`).
- **Admins** — dashboard with live stats, student roster, and company overview.
- **Eligibility engine** — server-enforced rules: minimum CGPA, maximum backlogs, allowed branches, open status, deadline.
- **Production deployment** — Nginx reverse proxy serving the built app + proxying `/api`, one-command `docker compose` startup.

## Tech Stack

| Layer | Technology | Why |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Componentized UI; Vite for fast dev/build; TS for compile-time safety |
| Backend | Node.js + Express + TypeScript | One language across the stack; minimal, battle-tested framework |
| Database | PostgreSQL | Relational data with strict integrity (unique apply, cascades) |
| ORM | Prisma | Schema-as-code + versioned migrations + generated types |
| Validation | Zod | Runtime validation at the API boundary |
| Auth | JWT + bcrypt | Stateless auth; hashed passwords |
| Infra | Docker + Nginx | Reproducible environments; reverse proxy + static serving |
| CI/CD | GitHub Actions | Lint, typecheck, build, and tests on every push |
| Tests | Vitest + Supertest + Testing Library | Backend integration tests; frontend component tests |

## Architecture

```
Browser ──▶ Nginx ──┬── static React build (production)
                    └── /api/* ──▶ Express/Prisma ──▶ PostgreSQL
```

In development, Vite's proxy plays Nginx's role (same `/api` path), so the frontend code is identical in both environments. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full write-up: data model, auth flow, request lifecycle, security notes, and design trade-offs.

## Repository Structure

```
placement-portal/
├── backend/                 # Express + Prisma + TypeScript API
│   ├── prisma/              # schema.prisma, migrations, seed
│   └── src/
│       ├── config/          # validated environment configuration
│       ├── lib/             # prisma, jwt, password, apiError
│       ├── middleware/      # authenticate, authorize, errorHandler
│       ├── routes/          # auth, students, jobs, applications, admin
│       ├── services/        # eligibility rules (pure functions)
│       └── test/            # integration tests + test utilities
├── frontend/                # React + Vite + TypeScript web app
│   └── src/
│       ├── api/             # typed API client per domain
│       ├── auth/            # session context + route guards
│       ├── components/      # shared UI (layout, badges)
│       └── pages/           # dashboards and flows per role
├── nginx/                   # production reverse-proxy config
├── .github/workflows/       # CI pipeline
├── docker-compose.yml       # development (Postgres only)
├── docker-compose.prod.yml  # production stack
└── docs/ARCHITECTURE.md     # architecture documentation
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker Desktop (for Postgres and the production stack)

### Development

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Prepare the backend
cd backend
cp .env.example .env          # then edit .env (secret, database URL)
npm install
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # optional: demo data + admin account
npm run dev                   # API on http://localhost:4000

# 3. In another terminal, start the frontend
cd ../frontend
npm install
npm run dev                   # web app on http://localhost:5173
```

Open http://localhost:5173.

### Production (Docker + Nginx)

```bash
# Set secrets in the environment or a root .env (JWT_SECRET, POSTGRES_USER, ...)
docker compose -f docker-compose.prod.yml up -d --build
# Open http://localhost:8080 — migrations apply automatically on start.
```

To seed demo data in production:

```bash
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
```

### Demo accounts (after `npm run db:seed`)

| Role | Email | Password |
| --- | --- | --- |
| Student | `alice@college.edu` | `secret123` |
| Student (low CGPA) | `bob@college.edu` | `secret123` |
| Recruiter | `bob@acme.com` | `secret123` |
| Recruiter | `jane@globex.com` | `secret123` |
| Admin | `admin@portal.com` | `admin123` |

## Testing

```bash
cd backend && npm test       # integration tests (needs the test DB, see below)
cd frontend && npm test      # component tests
```

The backend suite runs against a **separate test database** so it never touches your seeded data. Create it once:

```bash
docker compose exec db psql -U placement -d postgres \
  -c "CREATE DATABASE placement_portal_test"
```

The test runner applies migrations to it automatically before each run.

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main` and every pull request. Three parallel jobs:

- **Backend** — install, generate Prisma client, typecheck, lint, build, integration tests (against an ephemeral Postgres service).
- **Frontend** — install, typecheck, lint, build, component tests.
- **Docker** — builds both production images to catch Dockerfile regressions.

## API Overview

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | public | Create a student or recruiter account |
| `POST` | `/api/auth/login` | public | Authenticate, get a JWT |
| `GET` | `/api/auth/me` | any auth | Current user |
| `GET/PATCH` | `/api/students/me` | student | View / update own profile |
| `GET` | `/api/jobs` | any auth | Browse jobs (students see OPEN only) |
| `POST` | `/api/jobs` | recruiter | Post a job |
| `GET` | `/api/jobs/mine` | recruiter/admin | Own company's jobs |
| `GET/PATCH/DELETE` | `/api/jobs/:id` | owner/admin | Manage a job |
| `POST` | `/api/jobs/:id/apply` | student | Apply (eligibility-checked) |
| `GET` | `/api/jobs/:id/applications` | owner/admin | Applicants for a job |
| `GET` | `/api/applications/me` | student | Own applications |
| `GET` | `/api/applications` | admin | All applications |
| `PATCH` | `/api/applications/:id` | owner/admin | Update application status |
| `GET` | `/api/admin/*` | admin | Stats, students, companies |

## Milestones

- [x] **M1** — Project scaffolding & backend toolchain
- [x] **M2** — Database: PostgreSQL + Prisma schema
- [x] **M3** — Backend foundation (Express app, config, error handling)
- [x] **M4** — Authentication & authorization (JWT + roles)
- [x] **M5** — Core APIs (students, jobs, applications)
- [x] **M6** — Frontend foundation (routing, layout, auth pages)
- [x] **M7** — Frontend features (dashboards, apply flows)
- [x] **M8** — Docker + Nginx production setup
- [x] **M9** — CI/CD with GitHub Actions
- [x] **M10** — Hardening: tests & docs
