import { createFileRoute } from '@tanstack/react-router'
import { CalendarView45 } from '@/features/supcal/calendar-views/view-45'

export const Route = createFileRoute('/_authenticated/supcal/calendar-45')({
  component: CalendarView45,
})
