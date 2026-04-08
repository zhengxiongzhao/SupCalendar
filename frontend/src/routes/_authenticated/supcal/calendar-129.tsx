import { createFileRoute } from '@tanstack/react-router'
import { CalendarView129 } from '@/features/supcal/calendar-views/view-129'

export const Route = createFileRoute('/_authenticated/supcal/calendar-129')({
  component: CalendarView129,
})
