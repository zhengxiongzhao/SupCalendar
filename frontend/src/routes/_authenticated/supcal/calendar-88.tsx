import { createFileRoute } from '@tanstack/react-router'
import { CalendarView88 } from '@/features/supcal/calendar-views/view-88'

export const Route = createFileRoute('/_authenticated/supcal/calendar-88')({
  component: CalendarView88,
})
