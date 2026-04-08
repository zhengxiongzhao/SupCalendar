import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FileText, Clock, MessageSquare } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/date-time-picker'
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
import { getDefaultReminderTime } from '../../lib/urgency'
import {
  simpleRecordSchema,
  type SimpleRecordFormValues,
  PERIOD_OPTIONS,
} from '../../types'

function FormSection({
  icon: Icon,
  title,
  children,
  first = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  first?: boolean
}) {
  return (
    <div className={cn(!first && 'border-t pt-6', first && 'pt-2')}>
      <div className='mb-4 flex items-center gap-2'>
        <Icon className='h-4 w-4 text-muted-foreground' />
        <h3 className='text-sm font-medium text-muted-foreground'>{title}</h3>
      </div>
      {children}
    </div>
  )
}

interface SimpleFormProps {
  defaultValues?: Partial<SimpleRecordFormValues>
  onSubmit?: (values: SimpleRecordFormValues) => void
  submitText?: string
  submitLoading?: boolean
  extraActions?: React.ReactNode
}

export function SimpleForm({
  defaultValues,
  onSubmit: externalSubmit,
  submitText = '创建',
  submitLoading = false,
  extraActions,
}: SimpleFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreateSimpleRecord()

  const form = useForm<SimpleRecordFormValues>({
    resolver: zodResolver(simpleRecordSchema),
    defaultValues: {
      name: '',
      time: getDefaultReminderTime(),
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
        <FormSection icon={FileText} title='基本信息' first>
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
        </FormSection>

        <FormSection icon={Clock} title='时间设置'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormField
              control={form.control}
              name='time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提醒时间</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='选择提醒时间'
                      />
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
        </FormSection>

        <FormSection icon={MessageSquare} title='描述'>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
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
        </FormSection>

        <div className='flex items-center justify-between gap-3 border-t pt-6'>
          {extraActions ? <div>{extraActions}</div> : <div />}
          <div className='flex gap-3'>
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
        </div>
      </form>
    </Form>
  )
}
