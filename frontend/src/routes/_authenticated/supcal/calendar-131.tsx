import { createFileRoute } from '@tanstack/react-router'
import { CalendarView131 } from '@/features/supcal/calendar-views/view-131'

export const Route = createFileRoute('/_authenticated/supcal/calendar-131')({
  component: CalendarView131,
})
