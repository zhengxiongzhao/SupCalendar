import { createFileRoute } from '@tanstack/react-router'
import { CalendarView124 } from '@/features/supcal/calendar-views/view-124'

export const Route = createFileRoute('/_authenticated/supcal/calendar-124')({
  component: CalendarView124,
})
