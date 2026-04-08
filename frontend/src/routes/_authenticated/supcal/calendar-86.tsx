import { createFileRoute } from '@tanstack/react-router'
import { CalendarView86 } from '@/features/supcal/calendar-views/view-86'

export const Route = createFileRoute('/_authenticated/supcal/calendar-86')({
  component: CalendarView86,
})
