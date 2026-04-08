import { createFileRoute } from '@tanstack/react-router'
import { CalendarView102 } from '@/features/supcal/calendar-views/view-102'

export const Route = createFileRoute('/_authenticated/supcal/calendar-102')({
  component: CalendarView102,
})
