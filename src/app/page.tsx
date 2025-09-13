'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  category: string
  title: string
  description: string
  estimatedTime: number
  source: string
}

export default function Home() {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodayTask()
  }, [])

  const fetchTodayTask = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/today')
      
      if (!response.ok) {
        throw new Error('API request failed')
      }
      
      const data = await response.json()
      setTask(data.task)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskSubmit = async (taskId: string, completed: boolean) => {
    try {
      const startTime = Date.now() - 60000 // 1分前に開始したと仮定
      const endTime = Date.now()
      
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          startTime,
          endTime
        })
      })

      if (response.ok) {
        // タスク完了後、新しいタスクを取得
        fetchTodayTask()
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
            onClick={fetchTodayTask}
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

        {/* タスクカード */}
        {task && (
          <div className="max-w-lg mx-auto">
            <TaskCard 
              task={task} 
              onSubmit={handleTaskSubmit}
            />
          </div>
        )}

        {/* フッター */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Engineer Guild Hackathon 2025</p>
        </footer>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
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
      case 'health': return 'bg-red-100 text-red-800'
      case 'learning': return 'bg-blue-100 text-blue-800'
      case 'productivity': return 'bg-green-100 text-green-800'
      case 'relationships': return 'bg-purple-100 text-purple-800'
      case 'creativity': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'health': return '健康'
      case 'learning': return '学習'
      case 'productivity': return '生産性'
      case 'relationships': return '人間関係'
      case 'creativity': return '創造性'
      default: return category
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
          {getCategoryLabel(task.category)}
        </span>
        <span className="text-sm text-gray-500">
          ⏱️ {task.estimatedTime}分
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {task.title}
      </h3>

      <p className="text-gray-600 mb-6">
        {task.description}
      </p>

      <div className="text-center">
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? '完了中...' : '✓ 完了する'}
        </button>
      </div>
    </div>
  )
}