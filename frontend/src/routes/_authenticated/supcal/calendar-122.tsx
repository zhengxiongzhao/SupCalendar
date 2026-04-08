import { createFileRoute } from '@tanstack/react-router'
import { CalendarView122 } from '@/features/supcal/calendar-views/view-122'

export const Route = createFileRoute('/_authenticated/supcal/calendar-122')({
  component: CalendarView122,
})
