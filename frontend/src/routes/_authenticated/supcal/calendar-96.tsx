import { createFileRoute } from '@tanstack/react-router'
import { CalendarView96 } from '@/features/supcal/calendar-views/view-96'

export const Route = createFileRoute('/_authenticated/supcal/calendar-96')({
  component: CalendarView96,
})
