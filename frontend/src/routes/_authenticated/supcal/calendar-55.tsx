import { createFileRoute } from '@tanstack/react-router'
import { CalendarView55 } from '@/features/supcal/calendar-views/view-55'

export const Route = createFileRoute('/_authenticated/supcal/calendar-55')({
  component: CalendarView55,
})
