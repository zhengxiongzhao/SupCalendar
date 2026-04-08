import { createFileRoute } from '@tanstack/react-router'
import { CalendarView73 } from '@/features/supcal/calendar-views/view-73'

export const Route = createFileRoute('/_authenticated/supcal/calendar-73')({
  component: CalendarView73,
})
