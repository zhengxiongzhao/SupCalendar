import { createFileRoute } from '@tanstack/react-router'
import { CalendarView49 } from '@/features/supcal/calendar-views/view-49'

export const Route = createFileRoute('/_authenticated/supcal/calendar-49')({
  component: CalendarView49,
})
