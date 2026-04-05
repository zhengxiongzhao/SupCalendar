import { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  DollarSign,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRecord, useDeleteRecord, useUpdateSimpleRecord, useUpdatePaymentRecord } from '@/api/records'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { SettingsRow, FormSectionHeader, InlineSegment } from '@/components/ui/settings-row'
import { cn } from '@/lib/utils'
import { PERIOD_OPTIONS, CURRENCY_OPTIONS } from '@/types'
import type {
  PeriodType,
  Direction,
  Currency,
  SimpleRecordCreate,
  PaymentRecordCreate,
} from '@/types'
import { calculateEndTime, formatDateTimeLocal } from '@/lib/format-date'

const periodOptions = PERIOD_OPTIONS.map((p) => ({
  value: p.value,
  label: p.label,
}))

const directionOptions = [
  { value: 'income' as Direction, label: '收入', icon: <ArrowUpRight className='w-3.5 h-3.5' /> },
  { value: 'expense' as Direction, label: '支出', icon: <ArrowDownRight className='w-3.5 h-3.5' /> },
]

const inlineInputCls =
  'bg-transparent border-0 text-right text-sm font-medium w-full max-w-[200px] outline-none placeholder:text-muted-foreground/50 focus:ring-0'

export function EditPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const { data: record, isLoading, error } = useRecord(id)
  const deleteRecord = useDeleteRecord()
  const updateSimple = useUpdateSimpleRecord()
  const updatePayment = useUpdatePaymentRecord()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    direction: 'expense' as Direction,
    amount: 0,
    currency: 'CNY' as Currency,
    category: '',
    payment_method: '',
    period: 'month' as PeriodType,
    time: '',
    start_time: '',
    end_time: '',
    description: '',
    notes: '',
  })
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (record) {
      if (record.type === 'simple') {
        const r = record as Extract<typeof record, { type: 'simple' }>
        setForm({
          name: r.name,
          direction: 'expense',
          amount: 0,
          currency: 'CNY',
          category: '',
          payment_method: '',
          period: r.period,
          time: formatDateTimeLocal(r.time),
          start_time: '',
          end_time: '',
          description: r.description || '',
          notes: '',
        })
      } else if (record.type === 'payment') {
        const r = record as Extract<typeof record, { type: 'payment' }>
        setForm({
          name: r.name,
          direction: r.direction,
          amount: r.amount,
          currency: (r.currency === 'USD' ? 'USD' : 'CNY') as Currency,
          category: r.category,
          payment_method: r.payment_method,
          period: r.period,
          time: '',
          start_time: formatDateTimeLocal(r.start_time),
          end_time: r.end_time ? formatDateTimeLocal(r.end_time) : '',
          description: '',
          notes: r.notes || '',
        })
      }
    }
  }, [record])

  useEffect(() => {
    if (!isEndTimeManuallySet && record?.type === 'payment' && form.start_time && form.period) {
      const calculated = calculateEndTime(form.start_time, form.period)
      setForm((f) => ({ ...f, end_time: formatDateTimeLocal(calculated) }))
    }
  }, [form.start_time, form.period, isEndTimeManuallySet, record?.type])

  async function handleSubmit() {
    if (!record) return
    if (!form.name.trim()) {
      setSubmitError('请输入名称')
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      if (record.type === 'simple') {
        const data: SimpleRecordCreate = {
          name: form.name,
          time: form.time,
          period: form.period,
          description: form.description || undefined,
        }
        await updateSimple.mutateAsync({ id: record.id, data })
      } else {
        if (form.amount < 0) {
          setSubmitError('请输入有效金额')
          setIsSubmitting(false)
          return
        }
        const data: PaymentRecordCreate = {
          name: form.name,
          direction: form.direction,
          amount: form.amount,
          currency: form.currency,
          category: form.category,
          payment_method: form.payment_method,
          period: form.period,
          start_time: form.start_time,
          end_time: form.end_time || undefined,
          notes: form.notes || undefined,
        }
        await updatePayment.mutateAsync({ id: record.id, data })
      }
      toast.success('记录已更新')
      await navigate({ to: '/records' })
    } catch {
      toast.error('更新失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRecord.mutateAsync(deleteId)
      toast.success('记录已删除')
      setDeleteId(null)
      await navigate({ to: '/records' })
    } catch {
      toast.error('删除失败')
    }
  }

  if (isLoading) {
    return (
      <div className='max-w-lg mx-auto px-4 pt-4'>
        <div className='flex items-center justify-between py-3 mb-4'>
          <Button variant='ghost' size='sm' onClick={() => navigate({ to: '/records' })}>
            取消
          </Button>
          <h1 className='text-lg font-semibold'>编辑记录</h1>
          <div className='w-12' />
        </div>
        <div className='flex flex-col items-center justify-center py-16 gap-3'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className='max-w-lg mx-auto px-4 pt-4'>
        <div className='flex items-center justify-between py-3 mb-4'>
          <Button variant='ghost' size='sm' onClick={() => navigate({ to: '/records' })}>
            取消
          </Button>
          <h1 className='text-lg font-semibold'>编辑记录</h1>
          <div className='w-12' />
        </div>
        <div className='px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm'>
          记录不存在或加载失败
        </div>
        <div className='mt-4'>
          <Button variant='outline' onClick={() => navigate({ to: '/records' })}>
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  const isSimple = record.type === 'simple'
  const isPayment = record.type === 'payment'

  return (
    <div className='max-w-lg mx-auto px-4 pt-4 animate-in'>
      <div className='flex items-center justify-between py-3 mb-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: '/records' })}
        >
          取消
        </Button>
        <h1 className='text-lg font-semibold'>编辑记录</h1>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
        >
          完成
        </Button>
      </div>

      <div className='inline-flex items-center rounded-xl bg-muted/60 p-1 gap-0.5 w-full mb-4'>
        {([
          { key: 'simple' as const, label: '简单', icon: <Bell className='w-3.5 h-3.5' /> },
          { key: 'payment' as const, label: '收付款', icon: <DollarSign className='w-3.5 h-3.5' /> },
          { key: 'custom' as const, label: '自定义', icon: <Sparkles className='w-3.5 h-3.5' /> },
        ]).map((tab) => {
          const isActive =
            (isSimple && tab.key === 'simple') ||
            (isPayment && tab.key === 'payment')
          return (
            <div
              key={tab.key}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              {tab.icon}
              {tab.label}
            </div>
          )
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {submitError && (
          <div className='px-4 py-3 mb-2 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm'>
            {submitError}
          </div>
        )}

        <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
          <SettingsRow label='名称'>
            <input
              type='text'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder='输入名称...'
              className={inlineInputCls}
            />
          </SettingsRow>
        </div>

        {isPayment && (
          <>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden mt-3'>
              <SettingsRow label='流向'>
                <InlineSegment
                  options={directionOptions}
                  value={form.direction}
                  onChange={(v) => setForm({ ...form, direction: v })}
                />
              </SettingsRow>

              <SettingsRow label='金额'>
                <div className='flex items-center gap-1'>
                  <span className='text-xs text-muted-foreground'>
                    {form.currency === 'USD' ? '$' : '¥'}
                  </span>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={form.amount || ''}
                    onChange={(e) =>
                      setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder='0.00'
                    className={inlineInputCls}
                  />
                </div>
              </SettingsRow>

              <SettingsRow label='货币'>
                <InlineSegment
                  options={CURRENCY_OPTIONS.map((c) => ({
                    value: c.value,
                    label: `${c.symbol} ${c.label}`,
                  }))}
                  value={form.currency}
                  onChange={(v) => setForm({ ...form, currency: v })}
                />
              </SettingsRow>

              <SettingsRow label='分类'>
                <input
                  type='text'
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder='选择或输入分类'
                  className={inlineInputCls}
                />
              </SettingsRow>

              <SettingsRow label='付款方式'>
                <input
                  type='text'
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value })
                  }
                  placeholder='选择或输入方式'
                  className={inlineInputCls}
                />
              </SettingsRow>
            </div>

            <FormSectionHeader>时间设置</FormSectionHeader>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
              <SettingsRow label='开始时间'>
                <input
                  type='datetime-local'
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className={inlineInputCls}
                />
              </SettingsRow>

              <SettingsRow label='结束时间'>
                <div className='flex items-center gap-2'>
                  {!isEndTimeManuallySet && form.end_time && (
                    <span className='text-[10px] text-green-600 dark:text-green-400 shrink-0'>
                      自动
                    </span>
                  )}
                  <input
                    type='datetime-local'
                    value={form.end_time}
                    onChange={(e) => {
                      setForm({ ...form, end_time: e.target.value })
                      setIsEndTimeManuallySet(true)
                    }}
                    className={inlineInputCls}
                  />
                </div>
              </SettingsRow>
            </div>

            <FormSectionHeader>周期设置</FormSectionHeader>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
              <SettingsRow label='重复周期'>
                <InlineSegment
                  options={periodOptions}
                  value={form.period}
                  onChange={(v) => setForm({ ...form, period: v })}
                />
              </SettingsRow>
            </div>

            <FormSectionHeader>更多详情</FormSectionHeader>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
              <div className='flex items-start justify-between min-h-[48px] px-4 py-3'>
                <span className='text-sm text-foreground shrink-0 pt-0.5'>备注</span>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder='添加备注...'
                  rows={2}
                  className='border-0 bg-transparent text-right text-sm w-full max-w-[200px] resize-none p-0 focus-visible:ring-0'
                />
              </div>
            </div>
          </>
        )}

        {isSimple && (
          <>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden mt-3'>
              <SettingsRow label='提醒时间'>
                <input
                  type='datetime-local'
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={inlineInputCls}
                />
              </SettingsRow>
            </div>

            <FormSectionHeader>周期设置</FormSectionHeader>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
              <SettingsRow label='重复周期'>
                <InlineSegment
                  options={periodOptions}
                  value={form.period}
                  onChange={(v) => setForm({ ...form, period: v })}
                />
              </SettingsRow>
            </div>

            <FormSectionHeader>更多详情</FormSectionHeader>
            <div className='rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden'>
              <div className='flex items-start justify-between min-h-[48px] px-4 py-3'>
                <span className='text-sm text-foreground shrink-0 pt-0.5'>备注</span>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder='添加笔记...'
                  rows={2}
                  className='border-0 bg-transparent text-right text-sm w-full max-w-[200px] resize-none p-0 focus-visible:ring-0'
                />
              </div>
            </div>
          </>
        )}

        <div className='mt-8 pb-4'>
          <button
            type='button'
            onClick={() => setDeleteId(record.id)}
            disabled={isSubmitting}
            className='w-full bg-red-50 dark:bg-red-950/50 text-red-500 rounded-xl py-3 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors'
          >
            删除记录
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title='确认删除'
        desc='确定要删除这条记录吗？此操作无法撤销。'
        cancelBtnText='取消'
        confirmText='删除'
        destructive
        handleConfirm={handleDelete}
        isLoading={deleteRecord.isPending}
      />
    </div>
  )
}
