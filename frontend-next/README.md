# SupCalendar Frontend (Next.js)

Next.js 15 + React 19 frontend for SupCalendar financial calendar app.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State**: Zustand
- **i18n**: next-intl (en, zh-CN) — localePrefix: 'never' (no URL prefix)
- **Package Manager**: pnpm / npm

## Getting Started

### Development

```bash
cd frontend-next
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker Deployment

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── calendar/           # Calendar view
│   ├── records/            # Records list
│   ├── create/             # Create record
│   ├── edit/[id]/          # Edit record
│   └── profile/            # Profile page
├── components/
│   ├── calendar/           # Calendar components
│   ├── common/             # Shared components (ComboInput)
│   ├── dashboard/          # Dashboard components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components (DesktopNav, MobileNav)
│   └── ui/                 # shadcn/ui components
├── i18n/                   # i18n configuration
│   ├── routing.ts          # next-intl routing (localePrefix: 'never')
│   └── request.ts          # Server-side request config
├── messages/               # Translation files
│   ├── en.json
│   └── zh-CN.json
├── services/               # API client
├── stores/                 # Zustand stores (records, dashboard)
├── types/                   # TypeScript types
└── utils/                  # Utility functions
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=/api  # Backend API URL (default: /api)
```

## i18n Configuration

Using next-intl with `localePrefix: 'never'` — translations work via Accept-Language header detection, no URL prefix required:

- `/` → English (default)
- `/calendar` → English
- Backend detects locale from browser Accept-Language header

Translation files: `src/messages/en.json`, `src/messages/zh-CN.json`

## Features

- Dashboard with income/expense summary
- Calendar view with event markers
- Payment and simple record management (CRUD)
- i18n support (English, Chinese)
- Responsive design (desktop sidebar + mobile bottom nav)
- Docker production deployment

## Migration Status

Complete migration from Vue 3 to Next.js/React:

- [x] Framework scaffold (Next.js 15 + React 19)
- [x] Tailwind CSS v4 + shadcn/ui
- [x] next-intl i18n (localePrefix: 'never')
- [x] Zustand state management
- [x] Dashboard page
- [x] Calendar view
- [x] Records list with filtering
- [x] Create record (payment + simple)
- [x] Edit record
- [x] Profile page
- [x] Docker deployment (Dockerfile + docker-compose.yml)
