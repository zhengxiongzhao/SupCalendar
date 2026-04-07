import { createFileRoute } from '@tanstack/react-router'
import { CalendarView28 } from '@/features/supcal/calendar-views/view-28'

export const Route = createFileRoute('/_authenticated/supcal/calendar-28')({
  component: CalendarView28,
})
