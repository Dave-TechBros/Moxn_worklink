# Moxn Worklink

A multi-role job board / marketplace built with Next.js 16, Prisma, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Database**: SQLite (via Prisma ORM) — swap to PostgreSQL for production
- **Auth**: JWT in HttpOnly cookies (API Routes + Proxy)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Validation**: Zod
- **File Storage**: Database-stored blobs (resumes)

## Features

### Candidate
- Job search with keyword, location, employment type, salary range, tags
- Job detail view with company info
- 3-step application flow (profile confirm → resume + cover note → review)
- Application tracker with visual status pipeline (New → Reviewing → Interview → Offer/Closed)

### Employer
- Post/edit/close jobs with structured form (draft/published states)
- Job dashboard with applicant counts
- Kanban-style applicant pipeline per job (drag-and-drop status transitions)
- Applicant detail view with resume preview, cover note, status history, internal notes

### Admin
- Company management (list, search, suspend/reinstate)
- Flag/report queue (jobs & companies) with resolve actions

### Cross-cutting
- State machine for application status (validated transitions + audit trail)
- Role-based route guards via `proxy.ts` (Next.js 16 middleware replacement)
- Empty/Loading/Error states on every data view
- WCAG 2.2 AA accessible (contrast, keyboard nav, reduced motion)
- Design tokens (spacing, type, color, radius, elevation) — no one-off values

## Project Structure

```
src/
├── app/
│   ├── (public)/              # Public routes (no auth)
│   │   ├── page.tsx           # Landing
│   │   ├── jobs/page.tsx      # Search & filter
│   │   ├── jobs/[id]/page.tsx # Job detail
│   │   └── jobs/[id]/apply/   # Multi-step apply flow
│   ├── (auth)/                # Auth routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/             # Protected routes
│   │   ├── page.tsx           # Role-based redirect
│   │   ├── candidate/         # Candidate dashboard
│   │   ├── employer/          # Employer dashboard (jobs, pipeline)
│   │   └── admin/             # Admin dashboard
│   └── api/                   # Route handlers
│       ├── auth/              # Login, register, logout
│       ├── resumes/[id]/      # Resume upload/download
│       └── seed/              # Seed trigger
├── components/
│   ├── shared/                # Shared UI (ThemeToggle, PasswordInput, etc.)
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── prisma.ts              # Prisma client singleton (SQLite + Turso)
│   ├── session.ts             # JWT session helpers (verifySession, createSession)
│   └── utils.ts               # Formatters, status config, transitions
└── proxy.ts                   # Route guard (replaces middleware in Next.js 16)
prisma/
├── schema.prisma              # Data model
├── seed.ts                    # Comprehensive seed data
└── migrations/
```

## Getting Started

### Prerequisites
- Node.js 20.9+
- npm 10+

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-random-secret-here"
```

### Database

```bash
npx prisma migrate dev --name init
npm run prisma:seed    # or: npx prisma db seed
```

### Run

```bash
npm run dev
```

Open <http://localhost:3000>

### Build & Lint

```bash
npm run build
npm run lint
```

## Seed Data

The seed creates:
- **Admin**: `admin@moxn.com` / `password123`
- **Employers** (4 companies): Vercel, Stripe, Linear, Cal.com — each with a login
- **Candidates** (3): Alice, Bob, Carol — each with profile
- **Jobs** (10): Varied titles, locations, types, salary ranges, tags, statuses
- **Applications** (7): Distributed across all pipeline stages with status history
- **Flags** (2): One job, one company — for moderation demo

## Design System

Tokens defined in `src/app/globals.css`:

| Category | Tokens |
|----------|--------|
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Type scale | 12, 14, 16, 18, 20, 24, 30, 36, 48 |
| Color | HSL-based; semantic `success`, `warning`, `error`, `info` |
| Radius | sm/md/lg/xl |
| Elevation | card, modal, dropdown shadows |

All components use these tokens — no arbitrary values.

## Application Status Machine

```
new → reviewing → interview → offer → closed
         ↘ closed           ↘ closed
```

Transitions enforced in `lib/utils.ts` (`VALID_TRANSITIONS`, `isValidTransition`). Every change appends to `statusHistory` (JSON array) for audit trail.

## Auth & Authorization

- **API Routes** (`src/app/api/auth/`) handle login, register, logout
- **Session**: JWT (HS256, 7d expiry) in HttpOnly `SameSite=Lax` cookie
- **DAL**: `verifySession()` (cached via React `cache()`) called in every protected page
- **Proxy** (`proxy.ts`): Optimistic redirect only — reads cookie, no DB access. Real checks in DAL.
- **Roles**: `candidate`, `employer`, `admin` — enforced server-side everywhere

## Resume Upload

- Files stored as blobs in `File` table (SQLite BLOB; swap to S3/R2 for production)
- `POST /api/resumes/[id]` uploads, `GET /api/resumes/[id]` serves inline
- Candidate profile stores `resumeFileId` reference

## Accessibility

- Contrast ≥ 4.5:1 (verified on status badges, form fields, buttons)
- Full keyboard nav with visible focus rings
- Semantic HTML, proper `<label>` on every input
- `prefers-reduced-motion` respected (animations disabled)
- Alt text on logos/images

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import in Vercel
3. Add `DATABASE_URL` (Turso), `TURSO_AUTH_TOKEN`, and `JWT_SECRET` env vars
4. Deploy — Vercel runs `prisma generate && next build`

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
CMD ["npm", "start"]
```

## License

MIT
