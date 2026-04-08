import { createFileRoute } from '@tanstack/react-router'
import { CalendarView71 } from '@/features/supcal/calendar-views/view-71'

export const Route = createFileRoute('/_authenticated/supcal/calendar-71')({
  component: CalendarView71,
})
