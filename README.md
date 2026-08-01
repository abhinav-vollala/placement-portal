# College Placement Portal

A placement portal where **students** apply to company job offers, **recruiters** post and manage jobs for their company, and **admins** oversee the entire flow.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT with role-based access control |
| Infra | Docker + Nginx |
| CI/CD | GitHub Actions |

## Repository Structure

```
placement-portal/
├── backend/   # Express + Prisma + TypeScript
├── frontend/  # React + Vite + TypeScript (Milestone 6)
├── nginx/     # reverse proxy config (Milestone 8)
└── .github/   # CI/CD workflows (Milestone 9)
```

## Milestones

- [x] **M1** — Project scaffolding & backend toolchain
- [x] **M2** — Database: PostgreSQL + Prisma schema
- [x] **M3** — Backend foundation (Express app, config, error handling)
- [x] **M4** — Authentication & authorization (JWT + roles)
- [x] **M5** — Core APIs (students, jobs, applications)
- [x] **M6** — Frontend foundation (routing, layout, auth pages)
- [x] **M7** — Frontend features (dashboards, apply flows)
- [x] **M8** — Docker + Nginx production setup
- [ ] **M9** — CI/CD with GitHub Actions
- [ ] **M10** — Hardening: tests, docs, polish

## Getting Started

### Development

```bash
docker compose up -d          # PostgreSQL
cd backend && npm install && npm run dev   # API on :4000
cd frontend && npm install && npm run dev  # web app on :5173
```

Prisma CLI helpers: `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`.

### Production (Docker + Nginx)

```bash
# Optionally set secrets (root .env or shell):
#   JWT_SECRET, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
docker compose -f docker-compose.prod.yml up -d --build
# Open http://localhost:8080
```

The production stack runs Postgres, the API, and an Nginx server that serves
the built React app and proxies `/api` to the backend. Migrations apply
automatically on start. To seed demo data in production:

```bash
docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
```
