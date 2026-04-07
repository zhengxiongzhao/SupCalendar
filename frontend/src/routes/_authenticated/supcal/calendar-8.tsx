import { createFileRoute } from '@tanstack/react-router'
import { CalendarView8 } from '@/features/supcal/calendar-views/view-8'

export const Route = createFileRoute('/_authenticated/supcal/calendar-8')({
  component: CalendarView8,
})
