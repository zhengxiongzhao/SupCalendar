# SupCalendar Frontend (Next.js)

Next.js 15 + React 19 frontend for SupCalendar financial calendar app.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State**: Zustand
- **i18n**: next-intl (en, zh-CN)
- **Package Manager**: pnpm

## Getting Started

```bash
cd frontend-next
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

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
│   ├── common/             # Shared components
│   ├── dashboard/          # Dashboard components
│   ├── forms/              # Form components
│   ├── layout/             # Layout components (nav)
│   └── ui/                 # shadcn/ui components
├── i18n/                   # i18n configuration
├── messages/               # Translation files
├── services/               # API client
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=/api  # Backend API URL
```

## Features

- Dashboard with income/expense summary
- Calendar view with event markers
- Payment and simple record management
- i18n support (English, Chinese)
- Responsive design (desktop + mobile)

## Migration Status

This is a migration from Vue 3 to Next.js/React. All core features have been migrated:

- [x] Framework scaffold (Next.js 15 + React 19)
- [x] Tailwind CSS v4 + shadcn/ui
- [x] next-intl i18n (en, zh-CN)
- [x] Zustand state management
- [x] Dashboard page
- [x] Calendar view
- [x] Records list with filtering
- [x] Create record (payment + simple)
- [x] Edit record
- [x] Profile page
- [ ] Build verification (Node.js not available in current env)
