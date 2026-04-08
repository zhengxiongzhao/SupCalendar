import { createFileRoute } from '@tanstack/react-router'
import { CalendarView113 } from '@/features/supcal/calendar-views/view-113'

export const Route = createFileRoute('/_authenticated/supcal/calendar-113')({
  component: CalendarView113,
})
