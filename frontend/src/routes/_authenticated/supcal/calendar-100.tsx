import { createFileRoute } from '@tanstack/react-router'
import { CalendarView100 } from '@/features/supcal/calendar-views/view-100'

export const Route = createFileRoute('/_authenticated/supcal/calendar-100')({
  component: CalendarView100,
})
