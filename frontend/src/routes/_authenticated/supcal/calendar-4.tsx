import { createFileRoute } from '@tanstack/react-router'
import { CalendarView4 } from '@/features/supcal/calendar-views/view-4'

export const Route = createFileRoute('/_authenticated/supcal/calendar-4')({
  component: CalendarView4,
})
