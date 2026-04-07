import { createFileRoute } from '@tanstack/react-router'
import { CalendarView12 } from '@/features/supcal/calendar-views/view-12'

export const Route = createFileRoute('/_authenticated/supcal/calendar-12')({
  component: CalendarView12,
})
