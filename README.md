# EspañolPro — Language School Platform

A full-stack, production-ready school management SaaS for Spanish language schools. Built with Next.js 14, NestJS, Supabase, and Stripe.

## Architecture

```
language-school/
├── apps/
│   ├── web/          # Next.js 14 frontend (student, teacher, admin portals)
│   └── api/          # NestJS backend (REST API + WebSocket)
├── packages/
│   ├── types/        # Supabase-generated TypeScript types (shared)
│   ├── ui/           # Shared React component library (shadcn/ui base)
│   ├── utils/        # Date, currency, validation helpers
│   └── email-templates/  # React Email transactional templates
├── supabase/
│   └── migrations/   # PostgreSQL schema migrations
└── .github/
    └── workflows/    # CI/CD — lint, type-check, deploy
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui |
| Backend | NestJS · TypeScript · class-validator · Swagger |
| Database | PostgreSQL via Supabase (RLS enabled on all tables) |
| Auth | Supabase Auth · JWT RS256 · Google OAuth |
| Storage | Supabase Storage (documents, materials, certificates) |
| Payments | Stripe (PaymentIntents + webhooks) |
| Email | Resend + React Email |
| Video | Zoom API · Google Meet |
| Queues | BullMQ + Redis (automations, notifications) |
| Monorepo | Turborepo |
| Deploy | Vercel (web) · Railway (api) |

## Modules

1. **Student registration** — Multi-step form, Google/Apple OAuth, document upload, level assessment
2. **Course management** — A1–C2 levels, schedules, online/in-person modalities, waitlists
3. **Class enrollment** — Browse catalog, enroll, waitlist, auto-confirmation emails
4. **Teachers** — Profiles, specialties, availability, assigned courses, materials
5. **Schedule & calendar** — Personal calendar, Google Calendar sync, reminders
6. **Video classes** — Zoom/Meet auto-links, recording storage, join from platform
7. **Study materials** — PDFs, videos, audios, exercises, downloads, library
8. **Homework** — Submission, deadlines, teacher grading, AI-powered feedback
9. **Exams** — Online exams, auto-grading, results history, level certificates
10. **Attendance** — Auto-register on session start, manual teacher override, history
11. **Grades** — Weighted averages, grade book, reports, parent notifications
12. **Communication** — Student-teacher chat, admin chat, group messages, push notifications
13. **Payments** — Stripe enrollment + monthly fees, invoices, payment reminders, multiple methods
14. **Admin CRM** — Prospect tracking, sales funnel, call logs, conversion to student
15. **Student dashboard** — Courses, upcoming classes, pending homework, payments, certificates, gamification
16. **Teacher dashboard** — Student list, attendance, homework grading, calendar, materials
17. **Admin dashboard** — KPIs, revenue charts, active courses, teachers, downloadable reports
18. **Certificates** — Auto-generation, QR validation code, PDF download
19. **Multi-language** — Spanish, English, Ukrainian (next-intl)
20. **Automations** — BullMQ cron jobs: class reminders, payment alerts, welcome flows, renewal reminders

### Advanced features

- AI FAQ chatbot (OpenAI)
- AI conversation practice in Spanish
- Automatic level recommendation based on exam results
- Progress tracking with charts
- Gamification — points, badges, streaks
- Digital library
- Student forums
- Satisfaction surveys
- PWA (mobile-ready, offline support)
- Dark mode
- Multi-timezone support
- WhatsApp + Telegram + email integrations

## Database Schema

27 tables. Key design decisions:

- `profiles` extends `auth.users` — role (student/teacher/admin), timezone, language preference
- `class_sessions` is separate from `courses` — each session has its own Zoom link and recording URL
- `exams.questions` stored as `jsonb` — avoids 3–4 extra tables, supports auto-grading
- `payments` stores only Stripe PaymentIntent ID — amount in cents (integer) to avoid float issues
- `notifications` outbox pattern — one table, BullMQ dispatches to FCM/Resend/WhatsApp/Telegram
- `certificates.validation_hash` — SHA-256 of `(student_id + course_id + issued_at)` for QR validation

## Security

Three-layer model:

1. **Database (Supabase RLS)** — Row-level security on every table. Students see their own rows. Teachers see enrolled students in their courses. Admins use `service_role` key server-side only.
2. **API (NestJS)** — Helmet security headers, CORS whitelist, rate limiting (60 req/min global, 5 req/min on `/auth/*`), `class-validator` with `whitelist: true`, generic error responses in production.
3. **Application** — RS256 JWT validated against Supabase JWKS, `RolesGuard` + `@Roles()` decorators, signed URLs with expiry for all private storage, MIME-type validation on uploads.

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Supabase account
- Stripe account (test mode for development)

### Setup

```bash
# Install dependencies
npm install

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Run database migrations
npx supabase db push

# Start development
npm run dev
```

### Environment variables

See `apps/web/.env.example` and `apps/api/.env.example` for all required variables.

## Development Phases

| Phase | Features | Status |
|---|---|---|
| 1 — Foundation | Monorepo, Supabase schema, CI/CD | ✅ In progress |
| 2 — Auth & Identity | Login, registration, RBAC, i18n | 🔜 Next |
| 3 — Courses & Scheduling | Course CRUD, enrollment, Zoom, Calendar | 📋 Planned |
| 4 — Academic Engine | Materials, homework, exams, grades, certificates | 📋 Planned |
| 5 — Payments & Communication | Stripe, chat, push, email, CRM | 📋 Planned |
| 6 — AI & Automation | Chatbot, conversation AI, gamification, BullMQ | 📋 Planned |
| 7 — Polish & Deploy | PWA, dark mode, E2E tests, production | 📋 Planned |

## License

MIT
