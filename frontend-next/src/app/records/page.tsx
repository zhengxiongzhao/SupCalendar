'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, ArrowUpRight, ArrowDownRight, Calendar, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useRecordsStore } from '@/stores/records'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PaymentRecord, CalendarRecord } from '@/types'
import { formatAmount, formatDateWithNext, daysUntil, getUrgencyClass } from '@/utils/formatDate'

export default function RecordsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { records, fetchRecords, deleteRecord, loading } = useRecordsStore()
  const [filter, setFilter] = useState<'all' | 'payment' | 'simple'>('all')

  useEffect(() => {
    const filterParam = searchParams.get('filter')
    if (filterParam && ['payment', 'simple'].includes(filterParam)) {
      setFilter(filterParam as 'payment' | 'simple')
    }
    fetchRecords()
  }, [fetchRecords, searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'all') {
      params.set('filter', filter)
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : '/records', { scroll: false })
  }, [filter, router])

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records
    return records.filter((r): r is CalendarRecord => r.type === filter)
  }, [records, filter])

  function getRecordIcon(record: CalendarRecord) {
    if (record.type === 'payment') {
      const p = record as PaymentRecord
      return p.direction === 'income' ? <ArrowUpRight /> : <ArrowDownRight />
    }
    return <Calendar />
  }

  function getRecordColor(record: CalendarRecord) {
    if (record.type === 'payment') {
      const r = record as PaymentRecord
      return r.direction === 'income' 
        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' 
        : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    }
    return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
  }

  function getRecordAmount(record: CalendarRecord) {
    if (record.type === 'payment') {
      const r = record as PaymentRecord
      return (r.direction === 'income' ? '+' : '-') + formatAmount(r.amount, r.currency || 'CNY')
    }
    return '提醒'
  }

  function getRecordSubtitle(record: CalendarRecord) {
    if (record.type === 'payment') {
      return (record as PaymentRecord).category
    }
    return '简单提醒'
  }

  async function handleDelete(id: string) {
    if (confirm('确定要删除这条记录吗？')) {
      await deleteRecord(id)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">所有记录</h1>
        <Link href="/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            新建记录
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'payment', 'simple'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="whitespace-nowrap"
          >
            {f === 'all' ? '全部' : f === 'payment' ? '收付款' : '简单提醒'}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {!loading && filteredRecords.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-lg">暂无记录</p>
            <p className="text-sm text-muted-foreground mt-1">点击下方按钮创建第一条记录</p>
            <Link href="/create">
              <Button className="mt-4">
                <Plus className="w-5 h-5 mr-2" />
                新建记录
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && filteredRecords.length > 0 && (
        <Card>
          <CardContent className="p-0">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 flex items-center gap-4 hover:bg-accent transition-colors border-b border-border last:border-0"
              >
                <Link href={`/edit/${record.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0",
                      getRecordColor(record)
                    )}
                  >
                    {getRecordIcon(record)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{getRecordSubtitle(record)}</p>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "font-bold",
                        record.type === 'payment' && (record as PaymentRecord).direction === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-foreground'
                      )}
                    >
                      {getRecordAmount(record)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateWithNext(record.next_occurrence || record.created_at)}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn("mt-1", getUrgencyClass(daysUntil(record.next_occurrence || record.created_at)))}
                    >
                      {daysUntil(record.next_occurrence || record.created_at)} 天后
                    </Badge>
                  </div>
                </Link>

                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Link href={`/edit/${record.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
