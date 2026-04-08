import { createFileRoute } from '@tanstack/react-router'
import { CalendarView92 } from '@/features/supcal/calendar-views/view-92'

export const Route = createFileRoute('/_authenticated/supcal/calendar-92')({
  component: CalendarView92,
})
