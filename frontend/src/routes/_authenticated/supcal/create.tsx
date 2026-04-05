import { createFileRoute } from '@tanstack/react-router'
import { SupcalCreate } from '@/features/supcal/create'

export const Route = createFileRoute('/_authenticated/supcal/create')({
  component: SupcalCreate,
})
