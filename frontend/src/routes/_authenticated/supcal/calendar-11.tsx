import { createFileRoute } from '@tanstack/react-router'
import { CalendarView11 } from '@/features/supcal/calendar-views/view-11'

export const Route = createFileRoute('/_authenticated/supcal/calendar-11')({
  component: CalendarView11,
})
