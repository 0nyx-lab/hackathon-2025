'use client'

import { useEffect } from 'react'
import { TaskCard } from '@/components/TaskCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { useTask } from '@/hooks/useTask'

export default function Home() {
  const {
    task,
    loading,
    error,
    fetchTodayTask,
    handleTaskSelect,
    handleTaskComplete
  } = useTask()

  useEffect(() => {
    fetchTodayTask()
  }, [fetchTodayTask])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner message="今日のタスクを準備中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <ErrorDisplay error={error} onRetry={fetchTodayTask} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
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
                onSelect={handleTaskSelect}
                onComplete={handleTaskComplete}
              />
            </div>
          )}

          {/* フッター */}
          <footer className="text-center mt-12 text-gray-500">
            <p>Engineer Guild Hackathon 2025</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}