import { createFileRoute } from '@tanstack/react-router'
import { CalendarView61 } from '@/features/supcal/calendar-views/view-61'

export const Route = createFileRoute('/_authenticated/supcal/calendar-61')({
  component: CalendarView61,
})
