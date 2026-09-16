# Ana Paula Nail Designer

Sistema web completo de agendamento para manicure, mobile-first, com portal da cliente e painel administrativo.

## Stack

- **Backend:** Node.js + Express + TypeScript + Prisma + PostgreSQL + JWT
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router
- **Banco:** PostgreSQL (via Docker ou local)

## Estrutura

```
packages/
  backend/   # API REST (src/, prisma/)
  frontend/  # SPA React (src/)
docker-compose.yml  # sobe PostgreSQL (db) — perfis de app removidos
```

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 acessível (Docker ou local)
- npm

## Como rodar (desenvolvimento)

### 1. Banco de dados

Opção A — Docker (sobe só o Postgres):

```powershell
docker compose up -d db
```

Opção B — Postgres local: crie o banco `ana_nail_designer` e ajuste a `DATABASE_URL`.

### 2. Backend

```powershell
cd packages/backend
cp .env.example .env   # ajuste DATABASE_URL / JWT_SECRET se preciso
npm install
npx prisma generate
npx prisma db push
npm run db:seed        # cria admin + serviços + horários padrão
npm run dev            # http://localhost:3333
```

Credenciais do seed (configuráveis via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` no `.env`):

- Admin: `admin@anapaula.com` / `admin123`

### 3. Frontend

```powershell
cd packages/frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3333/api
npm install
npm run dev            # http://localhost:5173
```

> Em desenvolvimento o Vite também faz proxy de `/api` para `http://localhost:3333`.

## Fluxos principais

**Cliente:** cadastro → login → Serviços → Agendar (serviço → data → horário → observações → revisão) →
solicitação pendente → Meus agendamentos → cancelar (motivo obrigatório libera o horário).

**Manicure (admin):** login com conta admin → `/admin` (hoje, próximos, stats, confirmar/concluir/cancelar com
motivo) → notificações → Serviços (CRUD) → Horários (funcionamento semanal + bloqueios) → Calendário (dia/semana/mês).

## API (resumo)

- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`
- `GET /api/auth/me` · `PUT /api/auth/profile`
- `GET /api/appointments/services` · `GET /api/appointments/time-slots?date=&serviceId=` · `GET /api/appointments/calendar?year=&month=`
- `POST /api/appointments/book` · `GET /api/appointments/my-appointments` · `POST /api/appointments/my-appointments/:id/cancel`
- `GET /api/services` (admin: `POST/PUT/DELETE/PATCH :id/toggle`)
- `GET /api/admin/dashboard` · `GET /api/admin/appointments/by-date?date=` · `PUT /api/admin/appointments/:id/confirm|complete` · `POST /api/admin/appointments/:id/cancel`
- `GET|POST /api/admin/availability` · `PUT|DELETE /api/admin/availability/:id`
- `GET|POST /api/admin/blocked-slots` · `DELETE /api/admin/blocked-slots/:id` · `GET /api/admin/calendar-availability?year=&month=`
- `GET /api/notifications` · `GET /api/notifications/unread-count` · `GET /api/notifications/:id/read` · `POST /api/notifications/read-all`

## Regras implementadas

- Disponibilidade gerada no servidor a partir do funcionamento, intervalo, duração do serviço, agendamentos
  (PENDING/CONFIRMED) e bloqueios — sem sobreposição.
- Validação repetida no backend dentro de transação no momento da confirmação (anti dupla reserva).
- Motivo de cancelamento obrigatório (cliente e admin); cancelamento libera o horário automaticamente.
- RBAC: clientes só veem/cancelam os próprios agendamentos; rotas `/api/admin` e `/admin` exigem `ADMIN`.
- Notificações internas com sino + contador (novo agendamento, confirmação, cancelamento).
- Estrutura pronta para WhatsApp futuro: mensagens de confirmação/cancelamento já montadas nas notificações.

## Scripts úteis

```powershell
npm run build          # build backend + frontend
npm run db:studio      # Prisma Studio
```
