import { createFileRoute } from '@tanstack/react-router'
import { CalendarView60 } from '@/features/supcal/calendar-views/view-60'

export const Route = createFileRoute('/_authenticated/supcal/calendar-60')({
  component: CalendarView60,
})
