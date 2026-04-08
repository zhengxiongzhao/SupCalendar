import { createFileRoute } from '@tanstack/react-router'
import { CalendarView24 } from '@/features/supcal/calendar-views/view-24'

export const Route = createFileRoute('/_authenticated/supcal/calendar-24')({
  component: CalendarView24,
})
