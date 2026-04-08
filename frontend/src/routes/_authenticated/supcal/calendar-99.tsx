import { createFileRoute } from '@tanstack/react-router'
import { CalendarView99 } from '@/features/supcal/calendar-views/view-99'

export const Route = createFileRoute('/_authenticated/supcal/calendar-99')({
  component: CalendarView99,
})
