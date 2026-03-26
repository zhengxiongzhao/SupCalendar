'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PaymentRecordForm } from '@/components/forms/PaymentRecordForm'
import { SimpleRecordForm } from '@/components/forms/SimpleRecordForm'

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
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">新建记录</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'payment' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              收付款
            </span>
            {activeTab === 'payment' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button
            onClick={() => setActiveTab('simple')}
            className={`flex-1 py-4 text-center font-medium transition-colors relative ${
              activeTab === 'simple' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              简单提醒
            </span>
            {activeTab === 'simple' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'simple' ? (
            <SimpleRecordForm onSuccess={handleSuccess} />
          ) : (
            <PaymentRecordForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  )
}
