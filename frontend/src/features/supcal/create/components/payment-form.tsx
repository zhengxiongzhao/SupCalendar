import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Check,
  ChevronsUpDown,
  FileText,
  Wallet,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCreatePaymentRecord } from '../../api/records'
import { useCategories, usePaymentMethods } from '../../api/support'
import {
  paymentRecordSchema,
  type PaymentRecordFormValues,
  PERIOD_OPTIONS,
  DIRECTION_OPTIONS,
  CURRENCY_OPTIONS,
} from '../../types'
import { calculateEndTime } from '../../lib/urgency'

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

function ComboboxField({
  label,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onChange,
  isLoading,
}: {
  label: string
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  isLoading: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <FormItem className='space-y-2'>
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-full justify-between'
            >
              {value
                ? options.find((o) => o.value === value)?.label || value
                : placeholder}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <CommandItem disabled>加载中...</CommandItem>
                ) : (
                  options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormItem>
  )
}

interface PaymentFormProps {
  defaultValues?: Partial<PaymentRecordFormValues>
  onSubmit?: (values: PaymentRecordFormValues) => void
  submitText?: string
  submitLoading?: boolean
  extraActions?: React.ReactNode
}

export function PaymentForm({
  defaultValues,
  onSubmit: externalSubmit,
  submitText = '创建',
  submitLoading = false,
  extraActions,
}: PaymentFormProps) {
  const navigate = useNavigate()
  const createMutation = useCreatePaymentRecord()
  const categoriesQuery = useCategories()
  const paymentMethodsQuery = usePaymentMethods()

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
      description: '',
      ...defaultValues,
    },
  })

  function handlePeriodOrStartChange() {
    const startTime = form.getValues('start_time')
    const period = form.getValues('period')
    if (startTime && period) {
      form.setValue('end_time', calculateEndTime(startTime, period))
    }
  }

  function handleSubmit(values: PaymentRecordFormValues) {
    if (externalSubmit) {
      externalSubmit(values)
      return
    }
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('收付款记录已创建')
        navigate({ to: '/supcal' })
      },
      onError: () => {
        toast.error('创建失败')
      },
    })
  }

  const categoryOptions = (categoriesQuery.data || []).map((c) => ({
    value: c.name,
    label: c.name,
  }))

  const paymentMethodOptions = (paymentMethodsQuery.data || []).map((p) => ({
    value: p.name,
    label: p.name,
  }))

  const isSubmitting = externalSubmit ? submitLoading : createMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Section 1: 基本信息 */}
        <FormSection icon={FileText} title='基本信息' first>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder='例如：房租' {...field} />
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
                    <div className='inline-flex rounded-lg border bg-muted p-1'>
                      {DIRECTION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type='button'
                          className={cn(
                            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                            field.value === opt.value
                              ? opt.value === 'income'
                                ? 'bg-background shadow-sm text-emerald-700 dark:text-emerald-400'
                                : 'bg-background shadow-sm text-rose-700 dark:text-rose-400'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                          onClick={() => field.onChange(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Section 2: 金额与分类 */}
        <FormSection icon={Wallet} title='金额与分类'>
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
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
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
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
                    <FormLabel>货币</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.symbol} {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <ComboboxField
                    label='分类'
                    placeholder='选择或输入分类'
                    searchPlaceholder='搜索分类...'
                    emptyText='未找到分类，提交时将自动创建'
                    options={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    isLoading={categoriesQuery.isLoading}
                  />
                )}
              />

              <FormField
                control={form.control}
                name='payment_method'
                render={({ field }) => (
                  <ComboboxField
                    label='付款方式'
                    placeholder='选择或输入付款方式'
                    searchPlaceholder='搜索付款方式...'
                    emptyText='未找到付款方式，提交时将自动创建'
                    options={paymentMethodOptions}
                    value={field.value}
                    onChange={field.onChange}
                    isLoading={paymentMethodsQuery.isLoading}
                  />
                )}
              />
            </div>
          </div>
        </FormSection>

        {/* Section 3: 时间设置 */}
        <FormSection icon={Clock} title='时间设置'>
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='start_time'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>开始时间</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v)
                          setTimeout(handlePeriodOrStartChange, 0)
                        }}
                        placeholder='选择开始时间'
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
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        setTimeout(handlePeriodOrStartChange, 0)
                      }}
                    >
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
              name='end_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>结束时间</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='选择结束时间'
                      />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        {/* Section 4: 备注 */}
        <FormSection icon={MessageSquare} title='备注'>
          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder='添加备注信息...'
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
