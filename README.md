# CockroachHub — CJP Helpline

Emergency resource hub for student protesters in India. Works offline. Zero data collection. Built for the Cockroach Janta Party.

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 3, PWA (vite-plugin-pwa)
- **Backend:** FastAPI, SQLAlchemy 2.0 (async), PostgreSQL 17
- **Auth:** JWT + bcrypt, rate-limited login
- **Infrastructure:** Docker Compose (PostgreSQL)

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start backend (port 8000)
cd backend
uv sync
uv run uvicorn app.main:app --reload

# 3. Start frontend (port 5173, proxies /api to :8000)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

Create `backend/.env`:

```env
SECRET_KEY=<openssl rand -hex 32>
ADMIN_PASSWORD=<your-password>
```

| Variable | Default | Required |
|---|---|---|
| `SECRET_KEY` | — | **Yes** |
| `DATABASE_URL` | — | No |
| `ADMIN_EMAIL` | — | No |
| `ADMIN_PASSWORD` | — | **Yes** |
| `VAPID_PRIVATE_KEY` | auto-generated | No |

## Production Build

```bash
cd frontend
npm run build   # outputs to dist/
```

Serve `dist/` with nginx or Caddy. See deployment notes in AGENTS.md.

## Scripts

```bash
# Sync helpline data from Google Doc
cd backend
uv run python scripts/sync_helpline.py --url "https://docs.google.com/document/d/..."

# Sync from local markdown
uv run python scripts/sync_helpline.py --md test/helpline.md
```

## Features

- Emergency contacts (34 verified numbers — legal aid, medical, helplines)
- Live field feed (real-time alerts with 30s auto-refresh)
- Know Your Rights (BNSS-corrected legal protections)
- First aid guide (tear gas, lathi charge, pepper spray — PHR protocol)
- Fact check & rumor busting (NEET paper leak tracker)
- SOS emergency broadcast (one-tap alert + GPS to admins)
- Safe zones with Google Maps directions
- Bail & legal procedure guide (BNSS sections 478, 480, 482)
- Protest checklist (20 items, localStorage persisted)
- Mental health support directory (online & offline professionals)
- Aid & accommodation (Gurudwaras, Hemkunt Foundation)
- Trusted news sources (Instagram pages)
- Offline-first PWA (all guides cached)
- Stealth PIN mode (password-protected, fake weather screen)
- Auto-erase timer (30min inactivity → wipes data)
- Dark/light mode, English/Hindi

## Admin Panel

| Page | Features |
|---|---|
| Dashboard | Stats, charts, emergency broadcast |
| Submissions | Queue, approve/reject/publish, batch review |
| Alerts | CRUD with push notifications |
| Detainees | Tracker for detained protesters |
| Fact Checks | CRUD |
| Contacts | Manage emergency directory |
| Legal Rights | Manage Know Your Rights content |
| Announcements | Global banner |
| IP Blacklist | Block abusive IPs |
| Audit Log | Admin action history |
| Admins | Manage admin accounts |
