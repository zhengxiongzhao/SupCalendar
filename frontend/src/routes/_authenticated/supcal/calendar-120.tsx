import { createFileRoute } from '@tanstack/react-router'
import { CalendarView120 } from '@/features/supcal/calendar-views/view-120'

export const Route = createFileRoute('/_authenticated/supcal/calendar-120')({
  component: CalendarView120,
})
