import { createFileRoute } from '@tanstack/react-router'
import { CalendarView39 } from '@/features/supcal/calendar-views/view-39'

export const Route = createFileRoute('/_authenticated/supcal/calendar-39')({
  component: CalendarView39,
})
