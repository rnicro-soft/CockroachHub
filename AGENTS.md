# CockroachHub — Agent Memory

## Stack
- Frontend: React 19 + Vite 6 + Tailwind 3 + PWA (vite-plugin-pwa injectManifest)
- Backend: FastAPI + SQLAlchemy async + PostgreSQL 17 (Docker)
- Auth: JWT (jose) + bcrypt, 2h expiry, jti blacklist
- Queue: in-memory rate limiter (5/min submissions, 10/5min login)

## Project structure
```
helpline/
├── docker-compose.yml        # PostgreSQL 17 on port 5444
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI lifespan (seed + sync)
│   │   ├── config.py         # Pydantic settings from .env
│   │   ├── models.py         # 15 SQLAlchemy models
│   │   ├── schemas.py        # Pydantic request/response models
│   │   ├── auth.py           # JWT + bcrypt + token blacklist
│   │   ├── push.py           # VAPID push notifications
│   │   ├── ratelimit.py      # IP-based rate limiting + blacklist check
│   │   ├── seed.py           # Initial data seed
│   │   ├── helpline_sync.py  # Protest resource data
│   │   └── routers/          # auth.py, public.py, admin.py
│   └── scripts/
│       └── sync_helpline.py  # CLI: --url <google_doc>
├── frontend/
│   ├── src/
│   │   ├── pages/            # 16 public pages + 11 admin pages
│   │   ├── components/       # UI kit + layout
│   │   ├── hooks/            # useTheme, useAutoErase, useStealth, etc.
│   │   ├── store/            # Zustand auth store
│   │   ├── lib/api.ts        # Axios with JWT interceptor
│   │   └── data/             # Offline fallback JSON
│   └── vite.config.ts        # PWA, sitemap, proxy
```

## Key architectural decisions
- Pages are React.lazy() code-split (50 chunks, each <8KB)
- Navbar is memoized with module-level page import map for hover preload
- Dark/light mode via Tailwind `class` strategy + localStorage
- Stealth PIN gate wraps public layout (weather screen dummy)
- Auto-erase timer (30min inactivity → wipe + redirect to stealth)
- All admin list endpoints return paginated `{items, total, page, per_page}`
- Public endpoints return flat arrays
- Protests: pre/post checklists, first aid (PHR tear gas protocol), bail guide
- CJP-specific: manifesto, maroon branding, offline-first hero messaging

## NPM scripts
- `npm run dev` — Vite dev server (port 5173, proxies /api → :8000)
- `npm run build` — tsc + vite build
- `npm run lint` — tsc --noEmit

## Backend commands
- `uv run uvicorn app.main:app --reload` — dev server (port 8000)
- `uv run python scripts/sync_helpline.py --md test/helpline.md` — sync data
- `uv run python scripts/sync_helpline.py --url <google_doc_url>` — fetch + sync

## Docker
- `docker compose up -d` — PostgreSQL on 5444
- If port conflict: change in docker-compose.yml + backend/.env + config.py

## Default admin
- Email: admin@helpline.local
- Password: admin123 (forces change on first login)
- Set ADMIN_PASSWORD env var in production

## Security
- CORS restricted to cockroachhub.lol
- CSP headers via middleware
- JWT 2h expiry with jti blacklist (POST /api/auth/logout)
- Login rate limit: 10 attempts / 5 min per IP
- Submission rate limit: 5 / min per IP
- IP blacklist blocks submissions entirely
- Input length limits on all Pydantic schemas
- .env, .pem, node_modules in .gitignore

## Domain
- cockroachhub.lol
- Theme color: #800000 (maroon)
- PWA manifest, sitemap, OG image, JSON-LD all configured
