# Key Facts Template

This file demonstrates the format for storing project constants, configuration, and frequently-needed **non-sensitive** information. Organize by category using bullet lists.

## ⚠️ SECURITY WARNING: What NOT to Store Here

**NEVER store passwords, API keys, or sensitive credentials in this file.** This file is typically committed to version control and should only contain non-sensitive reference information.

**❌ NEVER store:**
- Passwords or passphrases
- API keys or authentication tokens
- Service account JSON keys or credentials
- Database passwords
- OAuth client secrets
- Private keys or certificates
- Session tokens
- Any secret values from environment variables

**✅ SAFE to store:**
- Database hostnames, ports, and cluster names
- Client names and project identifiers
- JIRA project keys and Confluence space names
- AWS/GCP account names and profile names
- API endpoint URLs (public URLs only)
- Service account email addresses (not the keys!)
- GCP project IDs and region names
- Docker registry names
- Environment names and deployment targets

**Where to store secrets:**
- `.env` files (excluded via `.gitignore`)
- Password managers (1Password, LastPass, Bitwarden)
- Secrets managers (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault)
- CI/CD environment variables (GitHub Secrets, GitLab Variables)
- Platform credential stores (Kubernetes Secrets, Cloud Run)

## Format

Organize information into logical categories:
- GCP/Cloud configuration
- Database connection details (hostnames, ports, cluster names)
- API endpoints (URLs only, not credentials)
- Local development setup (ports, service names)
- Important URLs
- Service accounts and permissions (emails and roles, not keys)

Use bullet lists for simplicity and easy scanning.

---

## Project-Specific Entries

### User Preferences

- **Language**: Chinese (中文) ← User preference set via /memory command
- **Default View**: 日历视图 (Calendar View)

### Local Development Ports

**Services:**
- Backend API: `8000`
- Frontend Dev: `5173`
- Frontend Docker: `3001`
- SQLite Database: `./sqlite_data/supcal.db`

### API Configuration

**Backend API:**
- Production: (not deployed)
- Local Development: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- API Prefix: `/api/v1/*`

### Frontend Configuration

**Dev Server:**
- URL: `http://localhost:5173`
- Dev Proxy: `/api/*` → `http://localhost:8000`

**Build:**
- Entry: `frontend/src/main.tsx`
- Router: TanStack Router (auto-generated `routeTree.gen.ts`)

---

## Tips

- Keep entries current (update when things change)
- Remove deprecated information after migration is complete
- Include both production and development details
- Add URLs to make navigation easier
- Use consistent formatting (same structure for similar items)
- Group related information together
- Mark deprecated items clearly with dates