'use client'

import { DashboardData } from '@/types'

interface DashboardProps {
  data: DashboardData | null
  onRefresh: () => void
}

export function Dashboard({ data, onRefresh }: DashboardProps) {
  if (!data) {
    return (
      <div className="px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  const { daily_summary, weekly_trend, badges } = data

  return (
    <div className="px-4 py-6 space-y-6">
      {/* 今日のサマリー */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">今日の成果</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {daily_summary.total_minutes}
            </div>
            <p className="text-sm text-gray-500">分達成</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {daily_summary.streak_days}
            </div>
            <p className="text-sm text-gray-500">日連続</p>
          </div>
        </div>
      </div>

      {/* 週間トレンド */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">週間トレンド</h2>
        <div className="space-y-3">
          {weekly_trend.map((day, index) => (
            <div key={day.date} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(day.minutes / 5 * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">
                  {day.minutes}分
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 非認知バッジ */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">成長バッジ</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">継続力</h3>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <span 
                  key={level}
                  className={`text-lg ${level <= badges.continuity ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">挑戦性</h3>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <span 
                  key={level}
                  className={`text-lg ${level <= badges.challenge ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">バランス</h3>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <span 
                  key={level}
                  className={`text-lg ${level <= badges.balance ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* アクティブカテゴリ */}
      {daily_summary.categories_active.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">今日の活動カテゴリ</h2>
          <div className="flex flex-wrap gap-2">
            {daily_summary.categories_active.map((category) => (
              <span 
                key={category}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
