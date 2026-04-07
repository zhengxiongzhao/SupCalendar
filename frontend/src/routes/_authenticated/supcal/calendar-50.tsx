import { createFileRoute } from '@tanstack/react-router'
import { CalendarView50 } from '@/features/supcal/calendar-views/view-50'

export const Route = createFileRoute('/_authenticated/supcal/calendar-50')({
  component: CalendarView50,
})
