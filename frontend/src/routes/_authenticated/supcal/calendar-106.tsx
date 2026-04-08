import { createFileRoute } from '@tanstack/react-router'
import { CalendarView106 } from '@/features/supcal/calendar-views/view-106'

export const Route = createFileRoute('/_authenticated/supcal/calendar-106')({
  component: CalendarView106,
})
