# EspañolPro — Language School Platform

A full-stack, production-ready school management SaaS for Spanish language schools.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui |
| Backend | NestJS · TypeScript · Prisma ORM |
| Database | **PostgreSQL** (Docker locally, Railway/Neon in production) |
| Auth | **JWT propio** en NestJS (bcrypt passwords, access + refresh tokens) |
| Storage | NestJS Multer (local dev) → S3 compatible (production) |
| Payments | Stripe (PaymentIntents + webhooks) |
| Email | Resend + React Email |
| Video | Zoom API · Google Meet |
| Queues | BullMQ + Redis |
| Monorepo | Turborepo |
| Deploy | Vercel (web) · Railway (api + postgres) |

> **No Supabase.** Base de datos PostgreSQL directa, autenticación JWT propia.

## Monorepo Structure

```
language-school/
├── apps/
│   ├── web/                  # Next.js 14 — portales estudiante, profesor, admin
│   └── api/                  # NestJS — REST API + WebSocket
│       └── prisma/
│           └── schema.prisma # Esquema completo (27 modelos)
├── packages/
│   ├── types/                # Tipos TypeScript compartidos
│   ├── ui/                   # Componentes React compartidos (shadcn/ui base)
│   └── utils/                # date, currency, cn helpers
├── docker-compose.yml        # PostgreSQL + Redis local
└── .github/workflows/ci.yml  # Lint + type-check en cada PR
```

## Quick Start

### 1. Levantar base de datos local

```bash
docker-compose up -d
```

### 2. Configurar variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edita `apps/api/.env`:
```
DATABASE_URL="postgresql://espanolpro:espanolpro_secret@localhost:5432/espanolpro"
JWT_SECRET=tu_secreto_largo_aqui
JWT_REFRESH_SECRET=otro_secreto_largo_aqui
```

### 3. Instalar dependencias y migrar DB

```bash
npm install
cd apps/api && npx prisma migrate dev --name init
```

### 4. Iniciar desarrollo

```bash
# Desde la raíz del monorepo
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs
- Prisma Studio: `cd apps/api && npx prisma studio`

## API Endpoints (MVP)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Registro de estudiante |
| POST | `/api/v1/auth/login` | — | Login, retorna JWT |
| POST | `/api/v1/auth/refresh` | — | Renovar access token |
| POST | `/api/v1/auth/logout` | JWT | Invalidar tokens |
| GET | `/api/v1/auth/me` | JWT | Perfil del usuario |
| GET | `/api/v1/courses` | — | Listar cursos activos |
| GET | `/api/v1/courses/:id` | — | Detalle de curso |
| POST | `/api/v1/courses` | Admin | Crear curso |
| POST | `/api/v1/courses/:id/enroll` | JWT | Inscribirse |
| DELETE | `/api/v1/courses/:id/enroll` | JWT | Cancelar inscripción |
| GET | `/api/v1/students/me/dashboard` | JWT | Dashboard del estudiante |

## Database (Prisma Schema — 27 modelos)

**Core:** `User`, `Student`, `Teacher`  
**Académico:** `Course`, `ClassSession`, `Enrollment`, `Attendance`, `Material`, `Homework`, `HomeworkSubmission`, `Exam`, `ExamAttempt`, `Grade`, `Certificate`  
**Comunicación:** `Message`, `Notification`, `ForumPost`  
**Pagos:** `Payment`  
**CRM:** `Prospect`, `CrmActivity`  
**Gamificación:** `Badge`, `StudentBadge`, `PointsEntry`  
**Soporte:** `Survey`, `SurveyResponse`, `CalendarEvent`

## Security

- Passwords: `bcryptjs` con 12 rondas de salt
- Auth: JWT access (15min) + refresh token (7 días) almacenado hasheado en DB
- API: Helmet headers, CORS whitelist, ThrottlerModule (5 req/min en `/auth/*`)
- Validación: `class-validator` con `whitelist: true` + `forbidNonWhitelisted: true`
- Roles: `RolesGuard` + `@Roles()` decorator en todos los endpoints privilegiados

## Módulos implementados

| Módulo | API | Frontend |
|---|---|---|
| Auth (registro, login, JWT refresh) | ✅ | ✅ |
| Catálogo de cursos + inscripción | ✅ | ✅ |
| Dashboard estudiante | ✅ | ✅ |
| Dashboard profesor | ✅ | ✅ |
| Dashboard admin | ✅ | ✅ |
| Materiales (upload Multer) | ✅ | ✅ |
| Tareas + entregas + calificación | ✅ | ✅ |
| Exámenes con auto-calificación | ✅ | ✅ |
| Asistencia por sesión | ✅ | ✅ |
| Calificaciones | ✅ | ✅ |
| Certificados QR + verificación pública | ✅ | ✅ |
| Pagos Stripe + webhooks | ✅ | ✅ |
| Chat en tiempo real (WebSocket) | ✅ | ✅ |
| Notificaciones + email Resend | ✅ | ✅ |
| CRM prospectos + embudo | ✅ | ✅ |
| Gamificación (puntos, badges, ranking) | ✅ | ✅ |
| Modo oscuro | — | ✅ |
| PWA manifest | — | ✅ |
| Multi-idioma (ES/EN/UK) | 📋 | 📋 |
| IA chatbot | 📋 | 📋 |

## Development Phases

| Phase | Features | Status |
|---|---|---|
| 1 — Foundation | Monorepo, Prisma schema, Docker, CI/CD, Auth API | ✅ Completo |
| 2 — Portales | Registro multistep, dashboards, catálogo de cursos | ✅ Completo |
| 3 — Académico | Materiales, tareas, pagos Stripe, certificados QR | ✅ Completo |
| 4 — Chat y CRM | WebSocket chat, exámenes, asistencia, gamificación, CRM | ✅ Completo |
| 5 — Admin & UX | Notificaciones Resend, dark mode, todas las páginas admin/teacher | ✅ Completo |
| 6 — AI y deploy | OpenAI chatbot, multi-idioma next-intl, tests E2E, Vercel+Railway | 📋 Planeado |

## License

MIT
