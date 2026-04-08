import { createFileRoute } from '@tanstack/react-router'
import { CalendarView132 } from '@/features/supcal/calendar-views/view-132'

export const Route = createFileRoute('/_authenticated/supcal/calendar-132')({
  component: CalendarView132,
})
