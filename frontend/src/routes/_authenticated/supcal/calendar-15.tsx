import { createFileRoute } from '@tanstack/react-router'
import { CalendarView15 } from '@/features/supcal/calendar-views/view-15'

export const Route = createFileRoute('/_authenticated/supcal/calendar-15')({
  component: CalendarView15,
})
