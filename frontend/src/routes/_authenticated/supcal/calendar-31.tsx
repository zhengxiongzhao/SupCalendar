import { createFileRoute } from '@tanstack/react-router'
import { CalendarView31 } from '@/features/supcal/calendar-views/view-31'

export const Route = createFileRoute('/_authenticated/supcal/calendar-31')({
  component: CalendarView31,
})
