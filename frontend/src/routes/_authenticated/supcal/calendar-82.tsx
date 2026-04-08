import { createFileRoute } from '@tanstack/react-router'
import { CalendarView82 } from '@/features/supcal/calendar-views/view-82'

export const Route = createFileRoute('/_authenticated/supcal/calendar-82')({
  component: CalendarView82,
})
