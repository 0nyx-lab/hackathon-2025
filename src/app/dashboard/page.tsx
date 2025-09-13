'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalTasks: number
  completedToday: number
  currentStreak: number
  totalPoints: number
  categories: Record<string, { completed: number; total: number }>
  recentActivities: Array<{
    id: string
    title: string
    category: string
    completedAt: string
    points: number
  }>
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const result = await response.json()
      setDashboardData(result.data)
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
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {dashboardData.totalTasks}
              </div>
              <p className="text-gray-600">総タスク数</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {dashboardData.completedToday}
              </div>
              <p className="text-gray-600">今日完了</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {dashboardData.currentStreak}
              </div>
              <p className="text-gray-600">継続日数</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {dashboardData.totalPoints}
              </div>
              <p className="text-gray-600">総ポイント</p>
            </div>
          </div>
        </div>

        {/* カテゴリ別進捗 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">カテゴリ別進捗</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(dashboardData.categories).map(([category, stats]) => (
              <div key={category} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {category === 'health' ? '健康' : 
                   category === 'learning' ? '学習' :
                   category === 'productivity' ? '生産性' :
                   category === 'relationships' ? '人間関係' :
                   category === 'creativity' ? '創造性' : category}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {stats.completed}/{stats.total} 完了
                  </span>
                  <span className="text-sm font-medium text-indigo-600">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">最近の活動</h2>
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border-l-4 border-indigo-500 bg-gray-50">
                <div>
                  <h3 className="font-medium text-gray-800">{activity.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(activity.completedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">+{activity.points}</div>
                  <div className="text-xs text-gray-500">ポイント</div>
                </div>
              </div>
            ))}
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
