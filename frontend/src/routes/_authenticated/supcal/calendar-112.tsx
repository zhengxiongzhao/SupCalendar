import { createFileRoute } from '@tanstack/react-router'
import { CalendarView112 } from '@/features/supcal/calendar-views/view-112'

export const Route = createFileRoute('/_authenticated/supcal/calendar-112')({
  component: CalendarView112,
})
