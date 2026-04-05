import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateSimpleRecord } from '@/api/records'
import { PERIOD_OPTIONS } from '@/types'
import {
  simpleRecordSchema,
  type SimpleRecordFormValues,
} from '../schemas'

interface SimpleFormProps {
  defaultValues?: Partial<SimpleRecordFormValues>
  onSubmit?: (data: SimpleRecordFormValues) => Promise<void>
}

export function SimpleForm({ defaultValues, onSubmit }: SimpleFormProps) {
  const navigate = useNavigate()
  const createSimple = useCreateSimpleRecord()

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

  const handleSubmit = async (data: SimpleRecordFormValues) => {
    if (onSubmit) {
      await onSubmit(data)
      return
    }
    try {
      await createSimple.mutateAsync(data)
      toast.success('提醒创建成功')
      await navigate({ to: '/records' })
    } catch {
      toast.error('创建失败，请重试')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='max-w-2xl space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder='请输入名称' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='time'
          render={({ field }) => (
            <FormItem>
              <FormLabel>时间</FormLabel>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='选择周期' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>备注</FormLabel>
              <FormControl>
                <Textarea placeholder='可选备注信息' className='resize-none' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => form.reset()}
          >
            重置
          </Button>
          <Button type='submit' disabled={createSimple.isPending}>
            {onSubmit ? '保存' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export type { SimpleRecordFormValues }
