export type RecordType = 'simple' | 'payment' | 'custom'

export type PeriodType = 'natural-month' | 'membership-month' | 'quarter' | 'year'

export type Direction = 'income' | 'expense'

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
  next_occurrence?: string
}

export type Record = SimpleRecord | PaymentRecord

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
}

export type SimpleRecordUpdate = Partial<SimpleRecordCreate>

export type PaymentRecordUpdate = Partial<PaymentRecordCreate>
