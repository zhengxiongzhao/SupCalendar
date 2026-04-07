import { format } from 'date-fns'
import type {
  CalendarRecord,
  PaymentRecord,
  SimpleRecord,
  PeriodType,
} from '../types'

function addPeriodToDate(date: Date, period: PeriodType): Date {
  const result = new Date(date)
  switch (period) {
    case 'week':
      result.setDate(result.getDate() + 7)
      break
    case 'month':
      result.setMonth(result.getMonth() + 1)
      break
    case 'quarter':
      result.setMonth(result.getMonth() + 3)
      break
    case 'half-year':
      result.setMonth(result.getMonth() + 6)
      break
    case 'year':
      result.setFullYear(result.getFullYear() + 1)
      break
  }
  return result
}

export function getOccurrencesInMonth(
  record: CalendarRecord,
  year: number,
  month: number
): Date[] {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

  const startTime =
    record.type === 'payment'
      ? (record as PaymentRecord).start_time
      : (record as SimpleRecord).time
  const endTime =
    record.type === 'payment'
      ? (record as PaymentRecord).end_time
      : null
  const period = record.period

  if (!startTime) return []

  const startDate = new Date(startTime)
  const endDate = endTime ? new Date(endTime) : null

  if (startDate > monthEnd) return []

  const occurrences: Date[] = []
  let current = new Date(startDate)

  while (current < monthStart) {
    if (endDate && current > endDate) return []
    const next = addPeriodToDate(current, period)
    if (next.getTime() <= current.getTime()) return []
    current = next
  }

  while (current <= monthEnd) {
    if (endDate && current > endDate) break
    if (current >= monthStart) {
      occurrences.push(
        new Date(current.getFullYear(), current.getMonth(), current.getDate())
      )
    }
    const next = addPeriodToDate(current, period)
    if (next.getTime() <= current.getTime()) break
    current = next
  }

  return occurrences
}

export function getRecordDotColor(record: CalendarRecord): string {
  if (record.type === 'payment') {
    return (record as PaymentRecord).direction === 'income'
      ? 'bg-emerald-500'
      : 'bg-rose-500'
  }
  return 'bg-blue-500'
}

export function getRecordColorClasses(record: CalendarRecord) {
  if (record.type === 'payment') {
    const p = record as PaymentRecord
    return p.direction === 'income'
      ? {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-700 dark:text-emerald-400',
          ring: 'ring-emerald-500/20',
          dot: 'bg-emerald-500',
        }
      : {
          bg: 'bg-rose-500/15',
          text: 'text-rose-700 dark:text-rose-400',
          ring: 'ring-rose-500/20',
          dot: 'bg-rose-500',
        }
  }
  return {
    bg: 'bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    dot: 'bg-blue-500',
  }
}

export function buildRecordsByDateMap(
  records: CalendarRecord[] | undefined,
  year: number,
  month: number
): Map<string, CalendarRecord[]> {
  const map = new Map<string, CalendarRecord[]>()
  if (!records) return map

  for (const record of records) {
    const occurrences = getOccurrencesInMonth(record, year, month)
    for (const date of occurrences) {
      const key = format(date, 'yyyy-MM-dd')
      const existing = map.get(key) || []
      existing.push(record)
      map.set(key, existing)
    }
  }

  return map
}

export function getFinancialSummary(records: CalendarRecord[]) {
  let income = 0
  let expense = 0
  for (const r of records) {
    if (r.type === 'payment') {
      const p = r as PaymentRecord
      if (p.direction === 'income') income += p.amount
      else expense += p.amount
    }
  }
  return { income, expense, balance: income - expense }
}

export { format }
