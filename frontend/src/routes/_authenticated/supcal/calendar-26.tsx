import { createFileRoute } from '@tanstack/react-router'
import { CalendarView26 } from '@/features/supcal/calendar-views/view-26'

export const Route = createFileRoute('/_authenticated/supcal/calendar-26')({
  component: CalendarView26,
})
