import { createFileRoute } from '@tanstack/react-router'
import { CalendarView103 } from '@/features/supcal/calendar-views/view-103'

export const Route = createFileRoute('/_authenticated/supcal/calendar-103')({
  component: CalendarView103,
})
