import { createFileRoute } from '@tanstack/react-router'
import { CalendarView101 } from '@/features/supcal/calendar-views/view-101'

export const Route = createFileRoute('/_authenticated/supcal/calendar-101')({
  component: CalendarView101,
})
