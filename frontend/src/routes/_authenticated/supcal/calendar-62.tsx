import { createFileRoute } from '@tanstack/react-router'
import { CalendarView62 } from '@/features/supcal/calendar-views/view-62'

export const Route = createFileRoute('/_authenticated/supcal/calendar-62')({
  component: CalendarView62,
})
