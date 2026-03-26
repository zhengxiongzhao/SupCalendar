'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useDashboardStore } from '@/stores/dashboard'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { PaymentList } from '@/components/dashboard/PaymentList'
import { UpcomingList } from '@/components/dashboard/UpcomingList'

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{currentMonth}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/calendar"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">查看日历</span>
          </Link>
          <Link
            href="/create"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>新建</span>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-medium">加载失败</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <button
            onClick={() => fetchAll()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重试
          </button>
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
