import { createFileRoute } from '@tanstack/react-router'
import { CalendarView25 } from '@/features/supcal/calendar-views/view-25'

export const Route = createFileRoute('/_authenticated/supcal/calendar-25')({
  component: CalendarView25,
})
