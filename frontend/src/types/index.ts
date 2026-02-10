export type RecordType = 'simple' | 'payment' | 'custom'

export type PeriodType = 'week' | 'month' | 'quarter' | 'half-year' | 'year'

export type Direction = 'income' | 'expense'

export type Currency = 'CNY' | 'USD'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  'CNY': '¥',
  'USD': '$',
}

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'CNY', label: '人民币', symbol: '¥' },
  { value: 'USD', label: '美元', symbol: '$' },
]

export interface BaseRecord {
  id: string
  type: RecordType
  created_at: string
  updated_at: string
}

export interface SimpleRecord extends BaseRecord {
  type: 'simple'
  name: string
  time: string
  period: PeriodType
  description?: string
  next_occurrence?: string
}

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

export type CalendarRecord = SimpleRecord | PaymentRecord

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

export type SimpleRecordUpdate = Partial<SimpleRecordCreate>

export type PaymentRecordUpdate = Partial<PaymentRecordCreate>
