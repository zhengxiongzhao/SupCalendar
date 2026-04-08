import { createFileRoute } from '@tanstack/react-router'
import { CalendarView78 } from '@/features/supcal/calendar-views/view-78'

export const Route = createFileRoute('/_authenticated/supcal/calendar-78')({
  component: CalendarView78,
})
