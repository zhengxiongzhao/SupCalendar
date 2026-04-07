import { createFileRoute } from '@tanstack/react-router'
import { CalendarView69 } from '@/features/supcal/calendar-views/view-69'

export const Route = createFileRoute('/_authenticated/supcal/calendar-69')({
  component: CalendarView69,
})
