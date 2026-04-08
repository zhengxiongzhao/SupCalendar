import { createFileRoute } from '@tanstack/react-router'
import { CalendarView89 } from '@/features/supcal/calendar-views/view-89'

export const Route = createFileRoute('/_authenticated/supcal/calendar-89')({
  component: CalendarView89,
})
