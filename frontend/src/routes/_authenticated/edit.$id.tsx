import { createFileRoute } from '@tanstack/react-router'
import { EditPage } from '@/features/edit'

export const Route = createFileRoute('/_authenticated/edit/$id')({
  component: EditPage,
})
