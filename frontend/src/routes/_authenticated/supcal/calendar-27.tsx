import { createFileRoute } from '@tanstack/react-router'
import { CalendarView27 } from '@/features/supcal/calendar-views/view-27'

export const Route = createFileRoute('/_authenticated/supcal/calendar-27')({
  component: CalendarView27,
})
