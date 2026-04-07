import { createFileRoute } from '@tanstack/react-router'
import { CalendarView48 } from '@/features/supcal/calendar-views/view-48'

export const Route = createFileRoute('/_authenticated/supcal/calendar-48')({
  component: CalendarView48,
})
