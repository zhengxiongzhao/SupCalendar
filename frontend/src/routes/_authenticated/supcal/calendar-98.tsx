import { createFileRoute } from '@tanstack/react-router'
import { CalendarView98 } from '@/features/supcal/calendar-views/view-98'

export const Route = createFileRoute('/_authenticated/supcal/calendar-98')({
  component: CalendarView98,
})
