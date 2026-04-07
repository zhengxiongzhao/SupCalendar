import { createFileRoute } from '@tanstack/react-router'
import { CalendarView13 } from '@/features/supcal/calendar-views/view-13'

export const Route = createFileRoute('/_authenticated/supcal/calendar-13')({
  component: CalendarView13,
})
