'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Bell, DollarSignIcon as Dollar } from 'lucide-react'
import { PaymentRecordForm } from '@/components/forms/PaymentRecordForm'
import { SimpleRecordForm } from '@/components/forms/SimpleRecordForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type RecordType = 'simple' | 'payment'

export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<RecordType>('payment')

  function handleSuccess() {
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">新建记录</h1>
      </div>

      <Card>
        <div className="flex border-b border-border">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('payment')}
            className={cn(
              "flex-1 py-4 text-center font-medium transition-colors relative rounded-none",
              activeTab === 'payment' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              收付款
            </span>
            {activeTab === 'payment' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('simple')}
            className={cn(
              "flex-1 py-4 text-center font-medium transition-colors relative rounded-none",
              activeTab === 'simple' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              简单提醒
            </span>
            {activeTab === 'simple' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </Button>
        </div>

        <CardContent className="p-6">
          {activeTab === 'simple' ? (
            <SimpleRecordForm onSuccess={handleSuccess} />
          ) : (
            <PaymentRecordForm onSuccess={handleSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
