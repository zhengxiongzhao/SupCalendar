import { createFileRoute } from '@tanstack/react-router'
import { CalendarView64 } from '@/features/supcal/calendar-views/view-64'

export const Route = createFileRoute('/_authenticated/supcal/calendar-64')({
  component: CalendarView64,
})
