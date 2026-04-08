import { createFileRoute } from '@tanstack/react-router'
import { CalendarView42 } from '@/features/supcal/calendar-views/view-42'

export const Route = createFileRoute('/_authenticated/supcal/calendar-42')({
  component: CalendarView42,
})
