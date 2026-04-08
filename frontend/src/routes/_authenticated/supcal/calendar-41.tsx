import { createFileRoute } from '@tanstack/react-router'
import { CalendarView41 } from '@/features/supcal/calendar-views/view-41'

export const Route = createFileRoute('/_authenticated/supcal/calendar-41')({
  component: CalendarView41,
})
