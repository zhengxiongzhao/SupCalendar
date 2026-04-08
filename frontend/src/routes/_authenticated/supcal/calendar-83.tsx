import { createFileRoute } from '@tanstack/react-router'
import { CalendarView83 } from '@/features/supcal/calendar-views/view-83'

export const Route = createFileRoute('/_authenticated/supcal/calendar-83')({
  component: CalendarView83,
})
