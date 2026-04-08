import { createFileRoute } from '@tanstack/react-router'
import { CalendarView121 } from '@/features/supcal/calendar-views/view-121'

export const Route = createFileRoute('/_authenticated/supcal/calendar-121')({
  component: CalendarView121,
})
