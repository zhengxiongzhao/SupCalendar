import { createFileRoute } from '@tanstack/react-router'
import { CalendarView108 } from '@/features/supcal/calendar-views/view-108'

export const Route = createFileRoute('/_authenticated/supcal/calendar-108')({
  component: CalendarView108,
})
