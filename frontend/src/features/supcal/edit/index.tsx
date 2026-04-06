import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useRecord,
  useDeleteRecord,
  useUpdatePaymentRecord,
  useUpdateSimpleRecord,
} from '../api/records'
import { PaymentForm } from '../create/components/payment-form'
import { SimpleForm } from '../create/components/simple-form'
import type {
  PaymentRecord,
  PaymentRecordFormValues,
  SimpleRecord,
  SimpleRecordFormValues,
} from '../types'

export function SupcalEdit() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const recordQuery = useRecord(id ?? '')
  const deleteMutation = useDeleteRecord()
  const updatePaymentMutation = useUpdatePaymentRecord()
  const updateSimpleMutation = useUpdateSimpleRecord()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const record = recordQuery.data

  function handleDelete() {
    if (!record) return
    deleteMutation.mutate(record.id, {
      onSuccess: () => {
        toast.success('记录已删除')
        navigate({ to: '/supcal' })
      },
      onError: () => {
        toast.error('删除失败')
      },
    })
  }

  function handlePaymentSubmit(values: PaymentRecordFormValues) {
    if (!record || record.type !== 'payment') return
    updatePaymentMutation.mutate(
      { id: record.id, values },
      {
        onSuccess: () => {
          toast.success('收付款记录已更新')
          navigate({ to: '/supcal' })
        },
        onError: () => {
          toast.error('更新失败')
        },
      }
    )
  }

  function handleSimpleSubmit(values: SimpleRecordFormValues) {
    if (!record || record.type !== 'simple') return
    updateSimpleMutation.mutate(
      { id: record.id, values },
      {
        onSuccess: () => {
          toast.success('提醒已更新')
          navigate({ to: '/supcal' })
        },
        onError: () => {
          toast.error('更新失败')
        },
      }
    )
  }

  if (recordQuery.isLoading) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='max-w-3xl space-y-4'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-96 w-full' />
          </div>
        </Main>
      </>
    )
  }

  if (recordQuery.isError || !record) {
    return (
      <>
        <Header>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex flex-col items-center justify-center py-12'>
            <p className='text-muted-foreground'>记录不存在</p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => navigate({ to: '/supcal' })}
            >
              返回首页
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const isPayment = record.type === 'payment'
  const isSubmitting =
    updatePaymentMutation.isPending || updateSimpleMutation.isPending

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>编辑记录</h1>
          <p className='text-muted-foreground'>
            修改「{record.name}」的信息
          </p>
        </div>

        <div className='max-w-3xl'>
          {isPayment ? (
            <PaymentForm
              defaultValues={{
                name: (record as PaymentRecord).name,
                direction: (record as PaymentRecord).direction,
                amount: (record as PaymentRecord).amount,
                currency: (record as PaymentRecord).currency as 'CNY' | 'USD',
                category: (record as PaymentRecord).category || '',
                payment_method: (record as PaymentRecord).payment_method,
                period: (record as PaymentRecord).period,
                start_time: (record as PaymentRecord).start_time,
                end_time: (record as PaymentRecord).end_time || '',
                notes: (record as PaymentRecord).notes || '',
                description: (record as PaymentRecord).description || '',
              }}
              onSubmit={handlePaymentSubmit}
              submitText='保存修改'
              submitLoading={isSubmitting}
              extraActions={
                <Button
                  type='button'
                  variant='outline'
                  className='text-destructive hover:text-destructive'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  删除记录
                </Button>
              }
            />
          ) : (
            <SimpleForm
              defaultValues={{
                name: (record as SimpleRecord).name,
                time: (record as SimpleRecord).time,
                period: (record as SimpleRecord).period,
                description: (record as SimpleRecord).description || '',
              }}
              onSubmit={handleSimpleSubmit}
              submitText='保存修改'
              submitLoading={isSubmitting}
              extraActions={
                <Button
                  type='button'
                  variant='outline'
                  className='text-destructive hover:text-destructive'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  删除记录
                </Button>
              }
            />
          )}
        </div>
      </Main>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='删除记录'
        desc='确定要删除这条记录吗？此操作无法撤销。'
        cancelBtnText='取消'
        confirmText='确认删除'
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
