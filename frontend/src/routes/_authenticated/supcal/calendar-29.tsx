import { createFileRoute } from '@tanstack/react-router'
import { CalendarView29 } from '@/features/supcal/calendar-views/view-29'

export const Route = createFileRoute('/_authenticated/supcal/calendar-29')({
  component: CalendarView29,
})
