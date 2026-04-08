import { createFileRoute } from '@tanstack/react-router'
import { CalendarView72 } from '@/features/supcal/calendar-views/view-72'

export const Route = createFileRoute('/_authenticated/supcal/calendar-72')({
  component: CalendarView72,
})
