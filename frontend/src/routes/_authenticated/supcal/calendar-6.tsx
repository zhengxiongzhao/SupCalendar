import { createFileRoute } from '@tanstack/react-router'
import { CalendarView6 } from '@/features/supcal/calendar-views/view-6'

export const Route = createFileRoute('/_authenticated/supcal/calendar-6')({
  component: CalendarView6,
})
