# AGENTS.md - SupCalandar

## Project Overview

Financial reminder calendar app with periodic income/expense tracking and external calendar integration (iCal, CalDAV, Google Calendar).

**Active Stack:**
- Frontend: Vite + React 19 + TanStack Router + Tailwind v4 + shadcn/ui
- Backend: FastAPI + SQLAlchemy + SQLite (default)

**Trash directories:** `frontend-trash-01/`, `frontend-trash-02/` - ignore.

---

## Developer Commands

```bash
# Frontend (Vite-based, NOT Next.js)
cd frontend
pnpm install
pnpm dev          # starts at localhost:5173
pnpm build        # production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm format:check
pnpm knip         # unused code detection

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Full stack (Docker)
docker-compose up -d --build
# frontend: http://localhost:3001
# backend API: http://localhost:8000
# API docs: http://localhost:8000/docs
```

---

## Important Conventions

### Frontend Routing
- Uses **TanStack Router** (NOT React Router or Next.js)
- Route file: `src/routeTree.gen.ts` - **auto-generated, do NOT edit manually**
- Edit routes in `src/routes/` - changes regenerate the tree
- Dev server proxy: `/api/*` → `http://localhost:8000`

### Backend API Prefix
- All routes under `/api/v1/*` (see `backend/app/main.py`)
- Example: `GET /api/v1/records`

### Linting
- Frontend ESLint enforces:
  - No `console.log` (error)
  - Type-only imports (`import type { ... }`)
  - No duplicate imports

### Database Migrations
- Backend uses Alembic (`backend/alembic/`)
- Run migrations manually after schema changes

---

## Environment Variables

```bash
# Root / Backend
DATABASE_TYPE=sqlite  # or postgresql
DATABASE_URL=sqlite:///./sqlite_data/supcal.db
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/calendar/callback/google
```

---

## Architecture Notes

- **Frontend entrypoint:** `frontend/src/main.tsx`
- **Backend entrypoint:** `backend/app/main.py`
- **State management:** Zustand stores in `frontend/src/stores/`
- **API client:** Axios + TanStack Query in `frontend/src/lib/`
- **Components:** shadcn/ui in `frontend/src/components/ui/` (don't lint)
- **Features:** organized in `frontend/src/features/`

---

## Known Quirks

1. The main README mentions `frontend-next/` (Next.js) - this directory doesn't exist. The active frontend is Vite-based in `frontend/`.
2. TanStack Router generates `routeTree.gen.ts` - never edit it directly.
3. ESLint ignores `dist/` and `src/components/ui/` directories.
4. Frontend Dockerfile builds with `--legacy-peer-deps` due to React 19 peer deps.
5. Backend runs on port 8000, frontend dev on 5173, Docker frontend on 3001.

---

## Project Memory System

This project maintains institutional knowledge in `docs/project_notes/` for consistency across sessions.

### Memory Files

- **bugs.md** - Bug log with dates, solutions, and prevention notes
- **decisions.md** - Architectural Decision Records (ADRs) with context and trade-offs
- **key_facts.md** - Project configuration, credentials, ports, important URLs
- **issues.md** - Work log with ticket IDs, descriptions, and URLs

### Memory-Aware Protocols

**Before proposing architectural changes:**
- Check `docs/project_notes/decisions.md` for existing decisions
- Verify the proposed approach doesn't conflict with past choices
- If it does conflict, acknowledge the existing decision and explain why a change is warranted

**When encountering errors or bugs:**
- Search `docs/project_notes/bugs.md` for similar issues
- Apply known solutions if found
- Document new bugs and solutions when resolved

**When looking up project configuration:**
- Check `docs/project_notes/key_facts.md` for credentials, ports, URLs, service accounts
- Prefer documented facts over assumptions

**When completing work on tickets:**
- Log completed work in `docs/project_notes/issues.md`
- Include ticket ID, date, brief description, and URL

**When user requests memory updates:**
- Update the appropriate memory file (bugs, decisions, key_facts, or issues)
- Follow the established format and style (bullet lists, dates, concise entries)

### Style Guidelines for Memory Files

- **Prefer bullet lists over tables** for simplicity and ease of editing
- **Keep entries concise** (1-3 lines for descriptions)
- **Always include dates** for temporal context
- **Include URLs** for tickets, documentation, monitoring dashboards
- **Manual cleanup** of old entries is expected (not automated)

---

## Quick Verification

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend build
cd frontend && pnpm build
```