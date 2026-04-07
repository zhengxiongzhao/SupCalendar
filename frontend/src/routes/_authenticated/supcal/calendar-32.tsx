import { createFileRoute } from '@tanstack/react-router'
import { CalendarView32 } from '@/features/supcal/calendar-views/view-32'

export const Route = createFileRoute('/_authenticated/supcal/calendar-32')({
  component: CalendarView32,
})
