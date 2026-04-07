import { createFileRoute } from '@tanstack/react-router'
import { CalendarView56 } from '@/features/supcal/calendar-views/view-56'

export const Route = createFileRoute('/_authenticated/supcal/calendar-56')({
  component: CalendarView56,
})
