import { createFileRoute } from '@tanstack/react-router'
import { CalendarView52 } from '@/features/supcal/calendar-views/view-52'

export const Route = createFileRoute('/_authenticated/supcal/calendar-52')({
  component: CalendarView52,
})
