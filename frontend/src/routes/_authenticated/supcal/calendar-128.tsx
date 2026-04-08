import { createFileRoute } from '@tanstack/react-router'
import { CalendarView128 } from '@/features/supcal/calendar-views/view-128'

export const Route = createFileRoute('/_authenticated/supcal/calendar-128')({
  component: CalendarView128,
})
