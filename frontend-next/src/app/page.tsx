'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDashboardStore } from '@/stores/dashboard'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { PaymentList } from '@/components/dashboard/PaymentList'
import { UpcomingList } from '@/components/dashboard/UpcomingList'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { summary, topPayments, upcomingSimples, loading, error, fetchAll } = useDashboardStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{currentMonth}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/calendar">
            <Button variant="outline">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">查看日历</span>
            </Button>
          </Link>
          <Link href="/create">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              <span>新建</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium">加载失败</p>
          <p className="text-destructive/80 text-sm mt-1">{error}</p>
          <Button onClick={() => fetchAll()} variant="destructive" className="mt-4">
            重试
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {summary && (
            <div className="grid grid-cols-2 gap-4">
              <SummaryCard title={t('income')} amount={summary.income} type="income" icon="↗" />
              <SummaryCard title={t('expense')} amount={summary.expense} type="expense" icon="↘" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentList records={topPayments} />
            <UpcomingList records={upcomingSimples} />
          </div>
        </>
      )}
    </div>
  )
}
