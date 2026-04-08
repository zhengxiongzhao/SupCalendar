import { createFileRoute } from '@tanstack/react-router'
import { CalendarView90 } from '@/features/supcal/calendar-views/view-90'

export const Route = createFileRoute('/_authenticated/supcal/calendar-90')({
  component: CalendarView90,
})
