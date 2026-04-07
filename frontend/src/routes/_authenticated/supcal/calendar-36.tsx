import { createFileRoute } from '@tanstack/react-router'
import { CalendarView36 } from '@/features/supcal/calendar-views/view-36'

export const Route = createFileRoute('/_authenticated/supcal/calendar-36')({
  component: CalendarView36,
})
