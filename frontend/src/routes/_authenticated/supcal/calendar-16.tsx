import { createFileRoute } from '@tanstack/react-router'
import { CalendarView16 } from '@/features/supcal/calendar-views/view-16'

export const Route = createFileRoute('/_authenticated/supcal/calendar-16')({
  component: CalendarView16,
})
