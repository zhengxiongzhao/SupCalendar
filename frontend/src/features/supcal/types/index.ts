import { z } from 'zod'

// Enums
export type PeriodType = 'week' | 'month' | 'quarter' | 'half-year' | 'year'
export type Direction = 'income' | 'expense'
export type Currency = 'CNY' | 'USD'
export type RecordType = 'simple' | 'payment' | 'custom'

// Constants
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
}

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CNY', label: '人民币', symbol: '¥' },
  { value: 'USD', label: '美元', symbol: '$' },
]

export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'quarter', label: '季度' },
  { value: 'half-year', label: '半年' },
  { value: 'year', label: '年' },
]

export const DIRECTION_OPTIONS: { value: Direction; label: string }[] = [
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
]

// Record types
export interface SimpleRecord {
  id: string
  type: 'simple'
  name: string
  time: string
  period: PeriodType
  description?: string | null
  next_occurrence?: string | null
  created_at: string
  updated_at: string
}

export interface PaymentRecord {
  id: string
  type: 'payment'
  name: string
  description?: string | null
  direction: Direction
  category?: string[] | null
  amount: number
  payment_method?: string[] | null
  period: PeriodType
  start_time: string
  end_time?: string | null
  notes?: string | null
  currency: string
  next_occurrence?: string | null
  created_at: string
  updated_at: string
}

export type CalendarRecord = SimpleRecord | PaymentRecord

// API types
export interface DashboardSummary {
  income: number
  expense: number
  balance: number
}

export interface ProfileStats {
  total_records: number
  total_income: number
  total_expense: number
  this_month_records: number
}

export interface ExportData {
  version: string
  export_date: string
  records: Array<{
    type: string
    id?: string
    title: string
    date?: string | null
    amount?: number
    currency?: string
    category?: string
    payment_type?: string
    repeat_type?: string
  }>
}

export interface ImportResult {
  success: boolean
  imported: number
  total: number
  simple_records: number
  payment_records: number
  errors: Array<{ index: number; reason: string }>
}

export interface Category {
  id: string
  user_id: string
  name: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  name: string
}

// Zod schemas for form validation
export const simpleRecordSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  time: z.string().min(1, '请选择提醒时间'),
  period: z.enum(['week', 'month', 'quarter', 'half-year', 'year'] as const),
  description: z.string(),
})

export const paymentRecordSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  direction: z.enum(['income', 'expense'] as const),
  amount: z.number().min(0, '金额不能为负'),
  currency: z.enum(['CNY', 'USD'] as const),
  category: z.array(z.string()).default([]),
  payment_method: z.array(z.string()).default([]),
  period: z.enum(['week', 'month', 'quarter', 'half-year', 'year'] as const),
  start_time: z.string().min(1, '请选择开始时间'),
  end_time: z.string(),
  notes: z.string(),
  description: z.string(),
})

export type SimpleRecordFormValues = z.infer<typeof simpleRecordSchema>
export type PaymentRecordFormValues = z.infer<typeof paymentRecordSchema>
