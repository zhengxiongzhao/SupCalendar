import { createFileRoute } from '@tanstack/react-router'
import { SupcalEdit } from '@/features/supcal/edit'

export const Route = createFileRoute('/_authenticated/supcal/edit/$id')({
  component: SupcalEdit,
})
