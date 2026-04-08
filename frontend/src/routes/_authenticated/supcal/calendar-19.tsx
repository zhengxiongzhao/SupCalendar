import { createFileRoute } from '@tanstack/react-router'
import { CalendarView19 } from '@/features/supcal/calendar-views/view-19'

export const Route = createFileRoute('/_authenticated/supcal/calendar-19')({
  component: CalendarView19,
})
