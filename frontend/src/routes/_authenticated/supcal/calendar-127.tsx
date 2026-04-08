import { createFileRoute } from '@tanstack/react-router'
import { CalendarView127 } from '@/features/supcal/calendar-views/view-127'

export const Route = createFileRoute('/_authenticated/supcal/calendar-127')({
  component: CalendarView127,
})
