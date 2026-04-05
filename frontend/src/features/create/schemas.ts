import { z } from 'zod/v4'

export const simpleRecordSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  time: z.string().min(1, '请选择时间'),
  period: z.enum(['week', 'month', 'quarter', 'half-year', 'year']),
  description: z.string().optional(),
})

export const paymentRecordSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  direction: z.enum(['income', 'expense']),
  amount: z.number({ error: '请输入有效金额' }).min(0, '金额不能为负'),
  currency: z.enum(['CNY', 'USD']),
  category: z.string().min(1, '请选择分类'),
  payment_method: z.string().min(1, '请选择付款方式'),
  period: z.enum(['week', 'month', 'quarter', 'half-year', 'year']),
  start_time: z.string().min(1, '请选择开始时间'),
  end_time: z.string().optional(),
  notes: z.string().optional(),
})

export type SimpleRecordFormValues = z.infer<typeof simpleRecordSchema>
export type PaymentRecordFormValues = z.infer<typeof paymentRecordSchema>
