import { createFileRoute } from '@tanstack/react-router'
import { CalendarView9 } from '@/features/supcal/calendar-views/view-9'

export const Route = createFileRoute('/_authenticated/supcal/calendar-9')({
  component: CalendarView9,
})
