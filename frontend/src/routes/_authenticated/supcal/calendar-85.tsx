import { createFileRoute } from '@tanstack/react-router'
import { CalendarView85 } from '@/features/supcal/calendar-views/view-85'

export const Route = createFileRoute('/_authenticated/supcal/calendar-85')({
  component: CalendarView85,
})
