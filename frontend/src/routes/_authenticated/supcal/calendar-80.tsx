import { createFileRoute } from '@tanstack/react-router'
import { CalendarView80 } from '@/features/supcal/calendar-views/view-80'

export const Route = createFileRoute('/_authenticated/supcal/calendar-80')({
  component: CalendarView80,
})
