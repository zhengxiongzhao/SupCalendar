import { createFileRoute } from '@tanstack/react-router'
import { CalendarView35 } from '@/features/supcal/calendar-views/view-35'

export const Route = createFileRoute('/_authenticated/supcal/calendar-35')({
  component: CalendarView35,
})
