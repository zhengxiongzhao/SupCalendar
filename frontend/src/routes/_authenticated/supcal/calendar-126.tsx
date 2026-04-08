import { createFileRoute } from '@tanstack/react-router'
import { CalendarView126 } from '@/features/supcal/calendar-views/view-126'

export const Route = createFileRoute('/_authenticated/supcal/calendar-126')({
  component: CalendarView126,
})
