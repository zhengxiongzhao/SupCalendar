import { createFileRoute } from '@tanstack/react-router'
import { CalendarView123 } from '@/features/supcal/calendar-views/view-123'

export const Route = createFileRoute('/_authenticated/supcal/calendar-123')({
  component: CalendarView123,
})
