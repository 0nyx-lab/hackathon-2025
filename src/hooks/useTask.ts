import { useState, useCallback } from 'react'
import { Task } from '@/types'

interface UseTaskState {
  task: Task | null
  loading: boolean
  error: string | null
}

interface UseTaskActions {
  fetchTodayTask: () => Promise<void>
  handleTaskSelect: (selectedTask: Task) => void
  handleTaskComplete: (taskId: string, duration: number, result: any) => Promise<void>
}

export function useTask(): UseTaskState & UseTaskActions {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodayTask = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/today')

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      if (data.task) {
        const transformedTask: Task = {
          ...data.task,
          estimated_seconds: data.task.estimatedTime * 60 || data.task.estimated_seconds || 60
        }
        setTask(transformedTask)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleTaskSelect = useCallback((selectedTask: Task) => {
    console.log('Task selected:', selectedTask)
  }, [])

  const handleTaskComplete = useCallback(async (taskId: string, duration: number, result: any) => {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: taskId,
          duration_seconds: duration,
          result,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        await fetchTodayTask()
      }
    } catch (err) {
      console.error('Task submission failed:', err)
      setError('タスクの送信に失敗しました')
    }
  }, [fetchTodayTask])

  return {
    task,
    loading,
    error,
    fetchTodayTask,
    handleTaskSelect,
    handleTaskComplete
  }
}