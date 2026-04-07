import { createFileRoute } from '@tanstack/react-router'
import { CalendarView22 } from '@/features/supcal/calendar-views/view-22'

export const Route = createFileRoute('/_authenticated/supcal/calendar-22')({
  component: CalendarView22,
})
