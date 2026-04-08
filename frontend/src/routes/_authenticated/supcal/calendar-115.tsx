import { createFileRoute } from '@tanstack/react-router'
import { CalendarView115 } from '@/features/supcal/calendar-views/view-115'

export const Route = createFileRoute('/_authenticated/supcal/calendar-115')({
  component: CalendarView115,
})
