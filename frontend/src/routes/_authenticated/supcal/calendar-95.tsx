import { createFileRoute } from '@tanstack/react-router'
import { CalendarView95 } from '@/features/supcal/calendar-views/view-95'

export const Route = createFileRoute('/_authenticated/supcal/calendar-95')({
  component: CalendarView95,
})
