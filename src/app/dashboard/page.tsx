'use client'

import { useState, useEffect } from 'react'
import { DashboardData } from '@/types'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard?user_id=demo_user_001')
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data: DashboardData = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">エラーが発生しました</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">データが見つかりません</h1>
          <p className="text-gray-600">ダッシュボードデータを取得できませんでした。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 ダッシュボード
          </h1>
          <p className="text-lg text-gray-600">
            あなたの成長を可視化
          </p>
        </header>

        {/* 今日のサマリー */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {dashboardData.daily_summary.total_minutes}
              </div>
              <p className="text-gray-600">今日の合計時間（分）</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dashboardData.daily_summary.categories_active.length}
              </div>
              <p className="text-gray-600">アクティブカテゴリ</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {dashboardData.daily_summary.streak_days}
              </div>
              <p className="text-gray-600">継続日数</p>
            </div>
          </div>
        </div>

        {/* 週間トレンド */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">週間トレンド</h2>
          <div className="grid grid-cols-7 gap-2">
            {dashboardData.weekly_trend.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                </div>
                <div 
                  className="bg-indigo-200 rounded"
                  style={{ height: `${Math.max(day.minutes * 4, 8)}px` }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">
                  {day.minutes}分
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* バッジ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">獲得バッジ</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <h3 className="font-semibold text-gray-800">継続力</h3>
              <p className="text-sm text-gray-600">レベル {dashboardData.badges.continuity}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-800">挑戦性</h3>
              <p className="text-sm text-gray-600">レベル {dashboardData.badges.challenge}</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <h3 className="font-semibold text-gray-800">バランス力</h3>
              <p className="text-sm text-gray-600">レベル {dashboardData.badges.balance}</p>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            今日のタスクに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
