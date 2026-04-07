import { createFileRoute } from '@tanstack/react-router'
import { CalendarView23 } from '@/features/supcal/calendar-views/view-23'

export const Route = createFileRoute('/_authenticated/supcal/calendar-23')({
  component: CalendarView23,
})
