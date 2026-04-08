import { createFileRoute } from '@tanstack/react-router'
import { CalendarView33 } from '@/features/supcal/calendar-views/view-33'

export const Route = createFileRoute('/_authenticated/supcal/calendar-33')({
  component: CalendarView33,
})
