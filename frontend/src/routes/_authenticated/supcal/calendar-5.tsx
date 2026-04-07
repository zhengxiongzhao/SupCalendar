import { createFileRoute } from '@tanstack/react-router'
import { CalendarView5 } from '@/features/supcal/calendar-views/view-5'

export const Route = createFileRoute('/_authenticated/supcal/calendar-5')({
  component: CalendarView5,
})
