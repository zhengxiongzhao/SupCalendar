import { useState } from 'react'
import { Plus, Pencil, Trash2, Tag, CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '../../api/support'
import type { Category, PaymentMethod } from '../../types'

function CategoryList() {
  const categoriesQuery = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name })
    } else {
      setEditingCategory(null)
      setFormData({ name: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('请输入分类名称')
      return
    }

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, name: formData.name },
        {
          onSuccess: () => {
            toast.success('分类已更新')
            setIsDialogOpen(false)
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { detail?: string } } }
            toast.error(err.response?.data?.detail || '更新失败')
          },
        }
      )
    } else {
      createMutation.mutate(
        { name: formData.name },
        {
          onSuccess: () => {
            toast.success('分类已创建')
            setIsDialogOpen(false)
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { detail?: string } } }
            toast.error(err.response?.data?.detail || '创建失败')
          },
        }
      )
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除分类「${name}」吗？`)) {
      deleteMutation.mutate(id, {
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { detail?: string } } }
          toast.error(err.response?.data?.detail || '删除失败')
        },
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Tag className='h-5 w-5' />
          分类管理
        </CardTitle>
        <CardDescription>管理您的收入和支出分类</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleOpenDialog()}
          className='w-full sm:w-auto'
        >
          <Plus className='mr-2 h-4 w-4' />
          添加分类
        </Button>

        {categoriesQuery.isLoading ? (
          <div className='flex items-center justify-center py-4'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='ml-2 text-muted-foreground'>加载中...</span>
          </div>
        ) : categoriesQuery.data?.length === 0 ? (
          <p className='text-sm text-muted-foreground py-4'>暂无分类</p>
        ) : (
          <div className='space-y-2'>
            {categoriesQuery.data?.map((category) => (
              <div
                key={category.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <span>{category.name}</span>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => handleOpenDialog(category)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive'
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑分类' : '添加分类'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? '修改分类名称' : '创建新的分类'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='category-name'>名称</Label>
              <Input
                id='category-name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='例如：餐饮、交通'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function PaymentMethodList() {
  const paymentMethodsQuery = usePaymentMethods()
  const createMutation = useCreatePaymentMethod()
  const updateMutation = useUpdatePaymentMethod()
  const deleteMutation = useDeletePaymentMethod()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  const handleOpenDialog = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method)
      setFormData({ name: method.name })
    } else {
      setEditingMethod(null)
      setFormData({ name: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('请输入付款方式名称')
      return
    }

    if (editingMethod) {
      updateMutation.mutate(
        { id: editingMethod.id, name: formData.name },
        {
          onSuccess: () => {
            toast.success('付款方式已更新')
            setIsDialogOpen(false)
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { detail?: string } } }
            toast.error(err.response?.data?.detail || '更新失败')
          },
        }
      )
    } else {
      createMutation.mutate(
        { name: formData.name },
        {
          onSuccess: () => {
            toast.success('付款方式已创建')
            setIsDialogOpen(false)
          },
          onError: (error: unknown) => {
            const err = error as { response?: { data?: { detail?: string } } }
            toast.error(err.response?.data?.detail || '创建失败')
          },
        }
      )
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除付款方式「${name}」吗？`)) {
      deleteMutation.mutate(id, {
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { detail?: string } } }
          toast.error(err.response?.data?.detail || '删除失败')
        },
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-5 w-5' />
          付款方式管理
        </CardTitle>
        <CardDescription>管理您的付款方式，如银行卡、支付宝等</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => handleOpenDialog()}
          className='w-full sm:w-auto'
        >
          <Plus className='mr-2 h-4 w-4' />
          添加付款方式
        </Button>

        {paymentMethodsQuery.isLoading ? (
          <div className='flex items-center justify-center py-4'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span className='ml-2 text-muted-foreground'>加载中...</span>
          </div>
        ) : paymentMethodsQuery.data?.length === 0 ? (
          <p className='text-sm text-muted-foreground py-4'>暂无付款方式</p>
        ) : (
          <div className='space-y-2'>
            {paymentMethodsQuery.data?.map((method) => (
              <div
                key={method.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <span>{method.name}</span>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={() => handleOpenDialog(method)}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive'
                    onClick={() => handleDelete(method.id, method.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? '编辑付款方式' : '添加付款方式'}</DialogTitle>
            <DialogDescription>
              {editingMethod ? '修改付款方式名称' : '创建新的付款方式'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='method-name'>名称</Label>
              <Input
                id='method-name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='例如：支付宝、微信、银行卡'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function CategoryPaymentMethodManagement() {
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <CategoryList />
      <PaymentMethodList />
    </div>
  )
}