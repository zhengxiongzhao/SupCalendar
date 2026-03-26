'use client'

import { useState, useEffect, useRef } from 'react'
import { profileApi } from '@/services/api'

interface Stats {
  total_records: number
  total_income: number
  total_expense: number
  this_month_records: number
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importFile, setImportFile] = useState<File | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadStats() {
    try {
      setLoading(true)
      setError('')
      const data = await profileApi.getStats()
      setStats(data as Stats)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  async function exportData() {
    try {
      setLoading(true)
      setError('')
      const data = await profileApi.exportData()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `supcalendar-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '导出失败')
    } finally {
      setLoading(false)
    }
  }

  async function importData() {
    if (!importFile) {
      setError('请先选择文件')
      return
    }

    try {
      setLoading(true)
      setError('')
      await profileApi.importData(importFile)
      alert('导入成功！页面将重新加载')
      window.location.reload()
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message || '导入失败')
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      setImportFile(event.target.files[0])
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">个人中心</h1>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">{error}</div>}

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-gray-500">总记录数</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.total_records || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-gray-500">总收入</span>
          </div>
          <p className="text-3xl font-bold text-green-600">¥{stats?.total_income || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-gray-500">总支出</span>
          </div>
          <p className="text-3xl font-bold text-red-600">¥{stats?.total_expense || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-gray-500">本月记录</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.this_month_records || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📤 导出数据</h2>
          <p className="text-gray-600 mb-4">导出所有记录为 JSON 文件，可用于备份或数据迁移。</p>
          <button
            onClick={exportData}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            导出所有记录
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📥 导入数据</h2>
          <p className="text-gray-600 mb-4">从 JSON 文件导入记录。注意：导入会合并数据，不会覆盖现有记录。</p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="importFile"
            />
            <label htmlFor="importFile" className="cursor-pointer flex flex-col items-center gap-2">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-gray-600">{importFile?.name || '点击选择文件'}</span>
              <span className="text-sm text-gray-400">支持 JSON 格式</span>
            </label>
          </div>

          <button
            onClick={importData}
            disabled={loading || !importFile}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            导入数据
          </button>
        </div>
      </div>
    </div>
  )
}
