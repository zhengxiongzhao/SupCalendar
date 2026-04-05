// Record types enum
export type RecordType = 'simple' | 'payment' | 'custom'

// Period types
export type PeriodType = 'week' | 'month' | 'quarter' | 'half-year' | 'year'

// Income/Expense direction
export type Direction = 'income' | 'expense'

// Currency
export type Currency = 'CNY' | 'USD'

// Currency display helpers
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
}

export const CURRENCY_OPTIONS: {
  value: Currency
  label: string
  symbol: string
}[] = [
  { value: 'CNY', label: '人民币', symbol: '¥' },
  { value: 'USD', label: '美元', symbol: '$' },
]

// Period label mapping
export const PERIOD_LABELS: Record<PeriodType, string> = {
  week: '每周',
  month: '每月',
  quarter: '每季度',
  'half-year': '每半年',
  year: '每年',
}

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

// Base record interface
export interface BaseRecord {
  id: string
  type: RecordType
  created_at: string
  updated_at: string
}

// Simple reminder record
export interface SimpleRecord extends BaseRecord {
  type: 'simple'
  name: string
  time: string
  period: PeriodType
  description?: string
  next_occurrence?: string
}

// Payment record
export interface PaymentRecord extends BaseRecord {
  type: 'payment'
  name: string
  description?: string
  direction: Direction
  category: string
  amount: number
  payment_method: string
  period: PeriodType
  start_time: string
  end_time?: string
  notes?: string
  currency: string
  next_occurrence?: string
}

// Union type for any record
export type CalendarRecord = SimpleRecord | PaymentRecord

// Support types
export interface Category {
  id: string
  name: string
  type: Direction
  color?: string
}

export interface PaymentMethod {
  id: string
  name: string
}

// Create DTOs
export interface SimpleRecordCreate {
  name: string
  time: string
  period: PeriodType
  description?: string
}

export interface PaymentRecordCreate {
  name: string
  description?: string
  direction: Direction
  category: string
  amount: number
  payment_method: string
  period: PeriodType
  start_time: string
  end_time?: string
  notes?: string
  currency?: string
}

// Update DTOs
export type SimpleRecordUpdate = SimpleRecordCreate
export type PaymentRecordUpdate = PaymentRecordCreate
