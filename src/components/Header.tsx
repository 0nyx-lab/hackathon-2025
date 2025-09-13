'use client'

import { DashboardData } from '@/types'

interface HeaderProps {
  dashboardData: DashboardData | null
  onRefresh: () => void
}

export function Header({ dashboardData, onRefresh }: HeaderProps) {
  const totalMinutes = dashboardData?.daily_summary?.total_minutes || 0
  const streakDays = dashboardData?.daily_summary?.streak_days || 0

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {/* ロゴ・タイトル */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Steppy</h1>
              <p className="text-xs text-gray-500">1分で始める成長習慣</p>
            </div>
          </div>

          {/* 今日の進捗 */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-bold text-gray-800">{streakDays}</span>
              </div>
              <p className="text-xs text-gray-500">日連続</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-bold text-blue-600">{totalMinutes}</span>
                <span className="text-sm text-gray-500">/5分</span>
              </div>
              <p className="text-xs text-gray-500">今日の達成</p>
            </div>

            {/* リフレッシュボタン */}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
