#!/usr/bin/env bash
set -e

echo "=== CockroachHub Deployment Script ==="
echo "Idempotent — safe to run multiple times."
echo ""

RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
step() { echo -e "${GREEN}[step]${NC} $1"; }
fail() { echo -e "${RED}[fail]${NC} $1"; exit 1; }

# 1. Pull latest
step "Pulling latest code..."
git pull origin main || fail "git pull failed"

# 2. Build frontend
step "Building frontend..."
cd frontend && npm install --silent 2>/dev/null && npm run build 2>/dev/null && cd .. || fail "Frontend build failed"

# 3. Run migrations + seed (single async session — no conflicts)
step "Running migrations and seeding..."
cd backend
./.venv/bin/python -c "
import asyncio, sys
sys.path.insert(0, '.')
from app.migrations import run_migrations
asyncio.run(run_migrations())
" || fail "Migrations failed"
cd ..

# 4. Restart backend
step "Done. If uvicorn isn't auto-restarting, run:"
echo "  cd backend && ./.venv/bin/uv run uvicorn app.main:app --reload --port 8228"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
