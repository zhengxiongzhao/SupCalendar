import { createFileRoute } from '@tanstack/react-router'
import { CalendarView59 } from '@/features/supcal/calendar-views/view-59'

export const Route = createFileRoute('/_authenticated/supcal/calendar-59')({
  component: CalendarView59,
})
