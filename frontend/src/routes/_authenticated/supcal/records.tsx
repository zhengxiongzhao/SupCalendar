import { createFileRoute } from '@tanstack/react-router'
import { SupcalRecords } from '@/features/supcal/records'

export const Route = createFileRoute('/_authenticated/supcal/records')({
  component: SupcalRecords,
})
