import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useRecords, useDeleteRecord } from '@/api/records'
import type { CalendarRecord, PaymentRecord, SimpleRecord } from '@/types'
import { PERIOD_LABELS } from '@/types'
import {
  formatAmount,
  daysUntil,
  getUrgencyClass,
  getUrgencyLabel,
  formatTime,
} from '@/lib/format-date'

export function RecordsPage() {
  const { data: records = [], isLoading } = useRecords()
  const deleteRecord = useDeleteRecord()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const filteredRecords = records.filter((record) => {
    if (activeTab === 'all') return true
    if (activeTab === 'payment') return record.type === 'payment'
    if (activeTab === 'simple') return record.type === 'simple'
    return true
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRecord.mutateAsync(deleteId)
      toast.success('记录已删除')
      setDeleteId(null)
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <>
      <Header>
        <h1 className='text-lg font-semibold'>所有记录</h1>
      </Header>
      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>所有记录</h1>
            <p className='text-sm text-muted-foreground'>
              共 {filteredRecords.length} 条记录
            </p>
          </div>
          <Link to='/create'>
            <Button>
              <Plus className='mr-2 size-4' />
              新建记录
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='all'>全部</TabsTrigger>
            <TabsTrigger value='payment'>收付款</TabsTrigger>
            <TabsTrigger value='simple'>简单提醒</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className='mt-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-20'>
                <Loader2 className='size-8 animate-spin text-muted-foreground' />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <p className='text-muted-foreground'>暂无记录</p>
                <Link to='/create'>
                  <Button variant='outline' className='mt-3'>
                    <Plus className='mr-2 size-4' />
                    添加第一条记录
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredRecords.map((record) => (
                  <RecordItem
                    key={record.id}
                    record={record}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
      </Main>
    </>
  )
}

function RecordItem({
  record,
  onDelete,
}: {
  record: CalendarRecord
  onDelete: (id: string) => void
}) {
  if (record.type === 'payment') {
    return (
      <PaymentRecordItem
        record={record as PaymentRecord}
        onDelete={onDelete}
      />
    )
  }
  return (
    <SimpleRecordItem record={record as SimpleRecord} onDelete={onDelete} />
  )
}

function PaymentRecordItem({
  record,
  onDelete,
}: {
  record: PaymentRecord
  onDelete: (id: string) => void
}) {
  const days = record.next_occurrence ? daysUntil(record.next_occurrence) : 999

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className='flex items-center'>
          <Link
            to='/edit/$id'
            params={{ id: record.id }}
            className='flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-accent'
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                record.direction === 'income'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {record.direction === 'income' ? '↗' : '↘'}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='truncate text-sm font-medium'>{record.name}</p>
                <span className='text-xs text-muted-foreground'>
                  {record.category || '未分类'}
                </span>
              </div>
              <div className='mt-0.5 flex items-center gap-2 text-xs text-muted-foreground'>
                <span>{PERIOD_LABELS[record.period]}</span>
                <span>·</span>
                <span>{record.payment_method}</span>
              </div>
            </div>
            <div className='shrink-0 text-right'>
              <p
                className={`text-sm font-semibold ${
                  record.direction === 'income'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {record.direction === 'income' ? '+' : '-'}
                {formatAmount(record.amount, record.currency)}
              </p>
              <div className='mt-1'>
                <Badge
                  variant='outline'
                  className={`text-xs ${getUrgencyClass(days)}`}
                >
                  {getUrgencyLabel(days)}
                </Badge>
              </div>
            </div>
          </Link>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2 shrink-0 text-muted-foreground hover:text-destructive'
            onClick={(e) => {
              e.stopPropagation()
              onDelete(record.id)
            }}
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SimpleRecordItem({
  record,
  onDelete,
}: {
  record: SimpleRecord
  onDelete: (id: string) => void
}) {
  const days = record.next_occurrence ? daysUntil(record.next_occurrence) : 999

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className='flex items-center'>
          <Link
            to='/edit/$id'
            params={{ id: record.id }}
            className='flex flex-1 items-center gap-3 p-4 transition-colors hover:bg-accent'
          >
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
              📅
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <p className='truncate text-sm font-medium'>{record.name}</p>
              </div>
              <div className='mt-0.5 flex items-center gap-2 text-xs text-muted-foreground'>
                <span>{PERIOD_LABELS[record.period]}</span>
                <span>·</span>
                <span>{formatTime(record.time)}</span>
              </div>
            </div>
            <div className='shrink-0 text-right'>
              <div>
                <Badge
                  variant='outline'
                  className={`text-xs ${getUrgencyClass(days)}`}
                >
                  {getUrgencyLabel(days)}
                </Badge>
              </div>
            </div>
          </Link>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2 shrink-0 text-muted-foreground hover:text-destructive'
            onClick={(e) => {
              e.stopPropagation()
              onDelete(record.id)
            }}
          >
            ✕
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
