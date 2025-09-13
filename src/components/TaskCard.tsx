'use client'

import { useState, useEffect, memo, useMemo, useCallback } from 'react'
import { Task } from '@/types'
import { taskCategories } from '@/data/tasks'

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
  onComplete: (taskId: string, duration: number, result: any) => void
}

function TaskCardComponent({ task, onSelect, onComplete }: TaskCardProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(task.estimated_seconds || 60)

  const categoryColors = useMemo(() => ({
    'health': 'bg-green-500',
    'learning': 'bg-blue-500',
    'productivity': 'bg-yellow-500',
    'relationship': 'bg-pink-500',
    'creativity': 'bg-purple-500',
    'mindfulness': 'bg-indigo-500'
  }), [])

  const categoryIcons = useMemo(() => ({
    'health': '💪',
    'learning': '📚',
    'productivity': '⚡',
    'relationship': '🤝',
    'creativity': '🎨',
    'mindfulness': '🧘'
  }), [])

  const handleStart = useCallback(() => {
    setIsExecuting(true)
    setTimeLeft(task.estimated_seconds || 60)
    onSelect(task)
  }, [task, onSelect])

  const handleComplete = useCallback(() => {
    const actualDuration = (task.estimated_seconds || 60) - timeLeft
    onComplete(task.id, actualDuration, { completed: true, confidence: 'high' })
    setIsExecuting(false)
  }, [task.id, task.estimated_seconds, timeLeft, onComplete])

  const handleSkip = useCallback(() => {
    onComplete(task.id, 0, { completed: false, reason: 'skipped' })
    setIsExecuting(false)
  }, [task.id, onComplete])

  // タイマー処理
  useEffect(() => {
    if (isExecuting && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isExecuting, timeLeft, handleComplete])

  const progressPercentage = useMemo(() => {
    const estimated = task.estimated_seconds || 60
    return ((estimated - timeLeft) / estimated) * 100
  }, [task.estimated_seconds, timeLeft])

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [timeLeft])

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md ${
      isExecuting ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* カードヘッダー */}
      <div className={`${categoryColors[task.category as keyof typeof categoryColors] || 'bg-gray-500'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white text-lg">
              {categoryIcons[task.category as keyof typeof categoryIcons] || '📝'}
            </span>
            <span className="text-white font-medium">
              {taskCategories.find(cat => cat.id === task.category)?.name || task.category}
            </span>
          </div>
          <div className="text-white text-sm">
            {task.estimated_seconds}秒
          </div>
        </div>
      </div>

      {/* カードコンテンツ */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2">
          {task.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {task.description}
        </p>

        {/* 実行中表示 */}
        {isExecuting ? (
          <div className="space-y-4">
            {/* タイマー */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formattedTime}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 実行中のコンテンツ */}
            {task.content && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-medium text-gray-800">
                  {task.content}
                </div>
              </div>
            )}

            {/* 操作ボタン */}
            <div className="flex space-x-3">
              <button
                onClick={handleComplete}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                完了
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                スキップ
              </button>
            </div>
          </div>
        ) : (
          /* 開始ボタン */
          <button
            onClick={handleStart}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            やってみる
          </button>
        )}
      </div>
    </div>
  )
}

export const TaskCard = memo(TaskCardComponent)
