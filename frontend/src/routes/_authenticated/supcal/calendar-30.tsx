import { createFileRoute } from '@tanstack/react-router'
import { CalendarView30 } from '@/features/supcal/calendar-views/view-30'

export const Route = createFileRoute('/_authenticated/supcal/calendar-30')({
  component: CalendarView30,
})
