import { createFileRoute } from '@tanstack/react-router'
import { CalendarView18 } from '@/features/supcal/calendar-views/view-18'

export const Route = createFileRoute('/_authenticated/supcal/calendar-18')({
  component: CalendarView18,
})
