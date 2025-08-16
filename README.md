# Campus Placement Review — Full Next.js App

Production-leaning project with:
- **Next.js 14 (App Router) + TypeScript**
- **Prisma + PostgreSQL**
- **NextAuth (Credentials)** password auth (campus domain allowlist)
- **Admin moderation UI**
- **Comments, Votes, Saves, Reports (auto-hide >=3)**
- **Search & filters + pg_trgm indices**
- **Safety filters** (PII masking + simple profanity check)
- **Basic rate limiting** (Upstash REST)

## 1) Prereqs
- Node 18+
- PostgreSQL (local/Supabase/Neon)

## 2) Setup
```bash
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, ALLOWED_DOMAIN
npm install
npx prisma migrate dev --name init
# Enable pg_trgm and indexes (optional but recommended)
psql "$DATABASE_URL" -f prisma/migrations/fts_trgm/migration.sql

npm run dev
```

Dev server: http://localhost:3000

## 3) Accounts
- Sign up with your campus email (e.g., prerantej.22bce8455@vitapstudent.ac.in).
- Make yourself admin:
  - `npx prisma studio` → set your `User.role` to `ADMIN`
  - Or SQL: `update "User" set "role"='ADMIN' where email='you@vitapstudent.ac.in';`

## 4) Features
- **Public**: Home with search & difficulty filters, company list & company pages, submission details with comments
- **Auth**: Signup/Login (password), submit journeys (stored anonymous for public)
- **Admin**: `/admin/moderation` queue, per-submission review page with **Approve/Reject**
- **API**:
  - `POST /api/auth/signup`
  - `GET/POST /api/submissions` (filters: `q, company, role, difficultyMin, difficultyMax, from, to`; `id` for single)
  - `POST /api/comments` & `GET /api/comments?submissionId=`
  - `POST /api/votes` (idempotent)
  - `POST /api/saves` (idempotent)
  - `POST /api/reports` (auto-hide >=3)
  - `POST /api/moderation/:id/approve|reject` (admin only)

## 5) Safety & rate limits
- Masks emails/phone numbers in journeys & comments.
- Blocks simple profanity (replace with a robust library later).
- Rate limits **signup** and **submit** (Upstash REST). Add `UPSTASH_REDIS_REST_URL/TOKEN` in `.env` for production.

## 6) Why this design?
- **All-in-one** Next.js: fewer moving parts, fast SSR/ISR for lists.
- **Prisma + Postgres**: easy relational modeling and migrations.
- **Credentials auth**: straight password login with domain allowlist.
- **Moderation-first**: submissions are pending by default; only approved show publicly.

## 7) Next ideas (if you want more tonight)
- Add **role hub** page `/roles/[role]`
- Viewer upvote/save buttons directly on cards (today we have endpoints; you can wire UI quickly)
- Add **pagination** for long lists
- Add **Sentry + PostHog**

Happy shipping! 🚀
