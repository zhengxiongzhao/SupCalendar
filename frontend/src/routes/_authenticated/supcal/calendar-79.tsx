import { createFileRoute } from '@tanstack/react-router'
import { CalendarView79 } from '@/features/supcal/calendar-views/view-79'

export const Route = createFileRoute('/_authenticated/supcal/calendar-79')({
  component: CalendarView79,
})
