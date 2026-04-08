import { createFileRoute } from '@tanstack/react-router'
import { CalendarView130 } from '@/features/supcal/calendar-views/view-130'

export const Route = createFileRoute('/_authenticated/supcal/calendar-130')({
  component: CalendarView130,
})
