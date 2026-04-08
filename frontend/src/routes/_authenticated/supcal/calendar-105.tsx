import { createFileRoute } from '@tanstack/react-router'
import { CalendarView105 } from '@/features/supcal/calendar-views/view-105'

export const Route = createFileRoute('/_authenticated/supcal/calendar-105')({
  component: CalendarView105,
})
