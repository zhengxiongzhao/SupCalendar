import { createFileRoute } from '@tanstack/react-router'
import { CalendarView77 } from '@/features/supcal/calendar-views/view-77'

export const Route = createFileRoute('/_authenticated/supcal/calendar-77')({
  component: CalendarView77,
})
