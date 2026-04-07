import { createFileRoute } from '@tanstack/react-router'
import { CalendarView3 } from '@/features/supcal/calendar-views/view-3'

export const Route = createFileRoute('/_authenticated/supcal/calendar-3')({
  component: CalendarView3,
})
