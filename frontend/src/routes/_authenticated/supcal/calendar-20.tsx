import { createFileRoute } from '@tanstack/react-router'
import { CalendarView20 } from '@/features/supcal/calendar-views/view-20'

export const Route = createFileRoute('/_authenticated/supcal/calendar-20')({
  component: CalendarView20,
})
