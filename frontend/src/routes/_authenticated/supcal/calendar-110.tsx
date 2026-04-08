import { createFileRoute } from '@tanstack/react-router'
import { CalendarView110 } from '@/features/supcal/calendar-views/view-110'

export const Route = createFileRoute('/_authenticated/supcal/calendar-110')({
  component: CalendarView110,
})
