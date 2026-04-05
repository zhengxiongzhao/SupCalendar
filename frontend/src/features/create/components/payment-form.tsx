import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { useCreatePaymentRecord } from '@/api/records'
import {
  PERIOD_OPTIONS,
  DIRECTION_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/types'
import { calculateEndTime, formatDateTimeLocal } from '@/lib/format-date'
import {
  paymentRecordSchema,
  type PaymentRecordFormValues,
} from '../schemas'

interface PaymentFormProps {
  defaultValues?: Partial<PaymentRecordFormValues>
  onSubmit?: (data: PaymentRecordFormValues) => Promise<void>
}

export function PaymentForm({ defaultValues, onSubmit }: PaymentFormProps) {
  const navigate = useNavigate()
  const createPayment = useCreatePaymentRecord()

  const form = useForm<PaymentRecordFormValues>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      name: '',
      direction: 'expense',
      amount: 0,
      currency: 'CNY',
      category: '',
      payment_method: '',
      period: 'month',
      start_time: '',
      end_time: '',
      notes: '',
      ...defaultValues,
    },
  })

  const period = form.watch('period')
  const startTime = form.watch('start_time')

  // Auto-calculate end_time when period or start_time changes
  useEffect(() => {
    if (startTime && period) {
      const calculated = calculateEndTime(startTime, period)
      const formatted = formatDateTimeLocal(calculated)
      form.setValue('end_time', formatted)
    }
  }, [period, startTime, form])

  const handleSubmit = async (data: PaymentRecordFormValues) => {
    const payload = {
      ...data,
      amount: Number(data.amount) || 0,
    }
    if (onSubmit) {
      await onSubmit(payload)
      return
    }
    try {
      await createPayment.mutateAsync(payload)
      toast.success('收付款记录创建成功')
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
          name='direction'
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型</FormLabel>
              <FormControl>
                <div className='flex gap-2'>
                  {DIRECTION_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type='button'
                      variant={field.value === option.value ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        field.value === option.value &&
                          option.value === 'income' &&
                          'bg-emerald-600 hover:bg-emerald-700',
                        field.value === option.value &&
                          option.value === 'expense' &&
                          'bg-red-600 hover:bg-red-700'
                      )}
                      onClick={() => field.onChange(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='amount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>金额</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='0.00'
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='currency'
            render={({ field }) => (
              <FormItem>
                <FormLabel>币种</FormLabel>
                <FormControl>
                  <div className='flex gap-2'>
                    {CURRENCY_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type='button'
                        variant={field.value === option.value ? 'default' : 'outline'}
                        className='flex-1'
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.symbol} {option.label}
                      </Button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类</FormLabel>
                <FormControl>
                  <Input placeholder='请输入分类' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='payment_method'
            render={({ field }) => (
              <FormItem>
                <FormLabel>付款方式</FormLabel>
                <FormControl>
                  <Input placeholder='请输入付款方式' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='start_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始时间</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='end_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>结束时间</FormLabel>
                <FormControl>
                  <Input type='datetime-local' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='notes'
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
          <Button type='submit' disabled={createPayment.isPending}>
            {onSubmit ? '保存' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export type { PaymentRecordFormValues }
