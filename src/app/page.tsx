'use client'

import { useState, useEffect } from 'react'
import { TodayResponse, TodayTask } from '@/types'

export default function Home() {
  const [todayData, setTodayData] = useState<TodayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodayTasks()
  }, [])

  const fetchTodayTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/today?user_id=demo_user_001')
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data: TodayResponse = await response.json()
      setTodayData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskSubmit = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/submit?user_id=demo_user_001', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskId,
          duration_seconds: 60,
          result: {
            completed,
            confidence: completed ? 'high' : 'low'
          },
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        // タスク完了後、今日のタスクを再取得
        fetchTodayTasks()
      }
    } catch (err) {
      console.error('Task submission failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">今日のタスクを準備中...</p>
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
            onClick={fetchTodayTasks}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            再試行
          </button>
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
            🚀 Steppy
          </h1>
          <p className="text-lg text-gray-600">
            1分で始める、人生の成長習慣
          </p>
        </header>

        {/* 推薦メッセージ */}
        {todayData?.recommendations && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                今日の推薦: {todayData.recommendations.primary}
              </h2>
              <p className="text-gray-600">
                {todayData.recommendations.balance_suggestion}
              </p>
            </div>
          </div>
        )}

        {/* タスクカード */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {todayData?.cards.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onSubmit={handleTaskSubmit}
            />
          ))}
        </div>

        {/* フッター */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Engineer Guild Hackathon 2025</p>
        </footer>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: TodayTask
  onSubmit: (taskId: string, completed: boolean) => void
}

function TaskCard({ task, onSubmit }: TaskCardProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(task.id, true)
      setIsCompleted(true)
    } catch (error) {
      console.error('Task completion failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '学習': return 'bg-blue-100 text-blue-800'
      case '仕事': return 'bg-green-100 text-green-800'
      case '健康': return 'bg-red-100 text-red-800'
      case '生活': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (isCompleted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {task.title}
          </h3>
          <p className="text-green-600 font-medium">完了しました！</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        <span className={`text-sm font-medium ${getDifficultyColor(task.difficulty)}`}>
          {task.difficulty === 'easy' ? '簡単' : task.difficulty === 'medium' ? '普通' : '難しい'}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {task.title}
      </h3>

      <p className="text-gray-600 mb-4">
        {task.description}
      </p>

      {task.content && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            <strong>内容:</strong> {task.content}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          ⏱️ {task.estimated_seconds}秒
        </span>
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '完了中...' : '完了する'}
        </button>
      </div>
    </div>
  )
}