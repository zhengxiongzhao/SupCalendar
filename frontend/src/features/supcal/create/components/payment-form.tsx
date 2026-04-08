import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ChevronsUpDown,
  X,
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
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useCreatePaymentRecord } from '../../api/records'
import { useCategories, usePaymentMethods, useAutoCreateCategory, useAutoCreatePaymentMethod } from '../../api/support'
import {
  paymentRecordSchema,
  type PaymentRecordFormValues,
  PERIOD_OPTIONS,
  DIRECTION_OPTIONS,
  CURRENCY_OPTIONS,
} from '../../types'
import { calculateEndTime, getDefaultStartTime } from '../../lib/urgency'

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

interface TagsSelectProps {
  label: string
  placeholder: string
  options: { value: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  isLoading: boolean
}

function TagsSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  isLoading,
}: TagsSelectProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = inputValue.trim()
    ? options.filter(o => 
        !value.includes(o.value) && (
          o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
          o.value.toLowerCase().includes(inputValue.toLowerCase())
        )
      )
    : options.filter(o => !value.includes(o.value))

  const handleSelectOption = (optionValue: string) => {
    onChange([...value, optionValue])
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleRemoveTag = (tagValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== tagValue))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        const trimmed = inputValue.trim()
        if (!value.includes(trimmed)) {
          if (options.find(o => o.value === trimmed)) {
            handleSelectOption(trimmed)
          } else {
            onChange([...value, trimmed])
          }
        }
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue.trim() && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  return (
    <FormItem className='space-y-2'>
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div 
            className={cn(
              'flex min-h-10 w-full cursor-text flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {value.length > 0 ? (
              value.map((v) => {
                const opt = options.find(o => o.value === v)
                return (
                  <span key={v} className='inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-primary'>
                    {opt?.label || v}
                    <button
                      type='button'
                      className='ml-1 rounded-full hover:bg-primary/20 p-0.5'
                      onClick={(e) => handleRemoveTag(v, e)}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </span>
                )
              })
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
            <input
              ref={inputRef}
              className='flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[60px] min-h-[20px]'
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                if (!open) setOpen(true)
              }}
              onKeyDown={handleInputKeyDown}
              placeholder={value.length > 0 ? '' : '输入搜索或新建...'}
            />
            <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className='p-0' 
          align='start'
          side='bottom'
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command shouldFilter={false}>
            <CommandList className='max-h-[200px] overflow-auto'>
              {isLoading ? (
                <CommandEmpty>加载中...</CommandEmpty>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className='py-3'>
                  {inputValue.trim() && !value.includes(inputValue.trim()) ? (
                    <button
                      type='button'
                      className='flex w-full items-center justify-center gap-1 px-2 py-1.5 text-sm text-green-600 hover:bg-accent rounded-md'
                      onClick={() => handleSelectOption(inputValue.trim())}
                    >
                      <span>按 Enter 添加</span>
                      <span className='font-medium'>"{inputValue.trim()}"</span>
                    </button>
                  ) : (
                    <span>无匹配选项</span>
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelectOption(option.value)}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
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
  const autoCreateCategory = useAutoCreateCategory()
  const autoCreatePaymentMethod = useAutoCreatePaymentMethod()

  const form = useForm({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      name: '',
      direction: 'expense' as const,
      amount: 0,
      currency: 'CNY' as const,
      category: [] as string[],
      payment_method: [] as string[],
      period: 'month' as const,
      start_time: getDefaultStartTime(),
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

  async function ensureCategoriesAndMethods(values: PaymentRecordFormValues) {
    const categoriesToCreate = values.category || []
    const methodsToCreate = values.payment_method || []
    
    await Promise.all([
      ...categoriesToCreate.map(async (name) => {
        const existing = categoriesQuery.data?.find(c => c.name === name)
        if (!existing) {
          await autoCreateCategory.mutateAsync({ name }).catch(() => {})
        }
      }),
      ...methodsToCreate.map(async (name) => {
        const existing = paymentMethodsQuery.data?.find(p => p.name === name)
        if (!existing) {
          await autoCreatePaymentMethod.mutateAsync({ name }).catch(() => {})
        }
      }),
    ])
  }

  async function handleSubmit(values: PaymentRecordFormValues) {
    if (externalSubmit) {
      externalSubmit(values)
      return
    }
    
    await ensureCategoriesAndMethods(values)
    
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
                  <TagsSelect
                    label='分类'
                    placeholder='选择或输入分类'
                    options={categoryOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    isLoading={categoriesQuery.isLoading}
                  />
                )}
              />

              <FormField
                control={form.control}
                name='payment_method'
                render={({ field }) => (
                  <TagsSelect
                    label='付款方式'
                    placeholder='选择或输入付款方式'
                    options={paymentMethodOptions}
                    value={field.value || []}
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
