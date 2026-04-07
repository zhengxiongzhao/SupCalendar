import { createFileRoute } from '@tanstack/react-router'
import { CalendarView63 } from '@/features/supcal/calendar-views/view-63'

export const Route = createFileRoute('/_authenticated/supcal/calendar-63')({
  component: CalendarView63,
})
