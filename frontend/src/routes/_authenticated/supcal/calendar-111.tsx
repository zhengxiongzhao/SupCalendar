import { createFileRoute } from '@tanstack/react-router'
import { CalendarView111 } from '@/features/supcal/calendar-views/view-111'

export const Route = createFileRoute('/_authenticated/supcal/calendar-111')({
  component: CalendarView111,
})
