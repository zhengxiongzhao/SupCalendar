import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCreateSimpleRecord } from '../../api/records'
import {
  simpleRecordSchema,
  type SimpleRecordFormValues,
  PERIOD_OPTIONS,
} from '../../types'

interface SimpleFormProps {
  defaultValues?: Partial<SimpleRecordFormValues>
  onSubmit?: (values: SimpleRecordFormValues) => void
  submitText?: string
  submitLoading?: boolean
}

export function SimpleForm({
  defaultValues,
  onSubmit: externalSubmit,
  submitText = '创建',
  submitLoading = false,
}: SimpleFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateSimpleRecord()

  const form = useForm<SimpleRecordFormValues>({
    resolver: zodResolver(simpleRecordSchema),
    defaultValues: {
      name: '',
      time: '',
      period: 'month',
      description: '',
      ...defaultValues,
    },
  })

  function handleSubmit(values: SimpleRecordFormValues) {
    if (externalSubmit) {
      externalSubmit(values)
      return
    }
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('提醒已创建')
        navigate({ to: '/supcal' })
      },
      onError: () => {
        toast.error('创建失败')
      },
    })
  }

  const isSubmitting = externalSubmit ? submitLoading : createMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder='例如：团队周会' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-4 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>提醒时间</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='period'
            render={({ field }) => (
              <FormItem>
                <FormLabel>重复周期</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        每{opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='添加描述信息...'
                  className='min-h-[80px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate({ to: '/supcal' })}
          >
            取消
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}
