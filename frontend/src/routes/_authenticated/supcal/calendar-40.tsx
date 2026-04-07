import { createFileRoute } from '@tanstack/react-router'
import { CalendarView40 } from '@/features/supcal/calendar-views/view-40'

export const Route = createFileRoute('/_authenticated/supcal/calendar-40')({
  component: CalendarView40,
})
