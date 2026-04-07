import { createFileRoute } from '@tanstack/react-router'
import { CalendarView10 } from '@/features/supcal/calendar-views/view-10'

export const Route = createFileRoute('/_authenticated/supcal/calendar-10')({
  component: CalendarView10,
})
