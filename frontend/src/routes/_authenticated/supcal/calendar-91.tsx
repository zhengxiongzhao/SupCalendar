import { createFileRoute } from '@tanstack/react-router'
import { CalendarView91 } from '@/features/supcal/calendar-views/view-91'

export const Route = createFileRoute('/_authenticated/supcal/calendar-91')({
  component: CalendarView91,
})
