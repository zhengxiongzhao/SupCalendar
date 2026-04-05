'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, Bell, Sparkles } from 'lucide-react'
import { PaymentRecordForm } from '@/components/forms/PaymentRecordForm'
import { SimpleRecordForm } from '@/components/forms/SimpleRecordForm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RecordType = 'simple' | 'payment'

const tabs: { value: RecordType | 'custom'; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
  { value: 'simple', label: '简单', icon: <Bell className="w-3.5 h-3.5" /> },
  { value: 'payment', label: '收付款', icon: <DollarSign className="w-3.5 h-3.5" /> },
  { value: 'custom', label: '自定义', icon: <Sparkles className="w-3.5 h-3.5" />, disabled: true },
]

export default function CreatePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<RecordType>('payment')

  function handleSuccess() {
    router.push('/')
  }

  return (
    <div className="max-w-lg mx-auto animate-in">
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm">取消</Button>
        </Link>
        <h1 className="text-lg font-semibold">新建记录</h1>
        <div className="w-12" />
      </div>

      <div className="inline-flex items-center rounded-xl bg-muted/60 p-1 gap-0.5 w-full mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setActiveTab(tab.value as RecordType)}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : tab.disabled
                    ? "text-muted-foreground/40 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'simple' ? (
        <SimpleRecordForm onSuccess={handleSuccess} />
      ) : (
        <PaymentRecordForm onSuccess={handleSuccess} />
      )}
    </div>
  )
}
