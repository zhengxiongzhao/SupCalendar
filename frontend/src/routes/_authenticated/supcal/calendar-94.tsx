import { createFileRoute } from '@tanstack/react-router'
import { CalendarView94 } from '@/features/supcal/calendar-views/view-94'

export const Route = createFileRoute('/_authenticated/supcal/calendar-94')({
  component: CalendarView94,
})
