import { createFileRoute } from '@tanstack/react-router'
import { CalendarView75 } from '@/features/supcal/calendar-views/view-75'

export const Route = createFileRoute('/_authenticated/supcal/calendar-75')({
  component: CalendarView75,
})
