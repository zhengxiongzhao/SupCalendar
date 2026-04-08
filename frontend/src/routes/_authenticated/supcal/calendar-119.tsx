import { createFileRoute } from '@tanstack/react-router'
import { CalendarView119 } from '@/features/supcal/calendar-views/view-119'

export const Route = createFileRoute('/_authenticated/supcal/calendar-119')({
  component: CalendarView119,
})
