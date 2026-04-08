import { createFileRoute } from '@tanstack/react-router'
import { CalendarView38 } from '@/features/supcal/calendar-views/view-38'

export const Route = createFileRoute('/_authenticated/supcal/calendar-38')({
  component: CalendarView38,
})
