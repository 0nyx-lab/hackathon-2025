import { useState, useCallback } from 'react'
import { Task } from '@/types'
import { getRandomTask, taskPool } from '@/data/tasks'
import { useProgress } from './useProgress'

export interface UseTaskState {
  task: Task | null
  loading: boolean
  error: string | null
  completedTasks: string[]
  currentTaskStartTime: number | null
}

export interface UseTaskActions {
  fetchTodayTask: () => Promise<void>
  generateNewTask: () => void
  handleTaskSelect: (task: Task) => void
  handleTaskComplete: (taskId: string, duration: number, result: any) => void
  handleTaskSkip: (task: Task) => void
  getNextTask: () => Task
}

export function useTask(): UseTaskState & UseTaskActions {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [currentTaskStartTime, setCurrentTaskStartTime] = useState<number | null>(null)

  const { recordTaskCompletion } = useProgress()

  const getNextTask = useCallback((): Task => {
    // 今日完了していないタスクを優先的に選択
    const availableTasks = taskPool.filter(t => !completedTasks.includes(t.id))

    if (availableTasks.length === 0) {
      // すべてのタスクが完了済みの場合は、ランダムに選択
      return getRandomTask()
    }

    // カテゴリバランスを考慮した選択
    const categoryCount: Record<string, number> = {}
    completedTasks.forEach(taskId => {
      const task = taskPool.find(t => t.id === taskId)
      if (task) {
        categoryCount[task.category] = (categoryCount[task.category] || 0) + 1
      }
    })

    // 最も少ないカテゴリのタスクを優先
    const categoryCounts = Object.entries(categoryCount)
    if (categoryCounts.length > 0) {
      const minCount = Math.min(...categoryCounts.map(([, count]) => count))
      const underrepresentedCategories = categoryCounts
        .filter(([, count]) => count === minCount)
        .map(([category]) => category)

      const preferredTasks = availableTasks.filter(task =>
        underrepresentedCategories.includes(task.category)
      )

      if (preferredTasks.length > 0) {
        const randomIndex = Math.floor(Math.random() * preferredTasks.length)
        return preferredTasks[randomIndex]
      }
    }

    // フォールバック: ランダム選択
    const randomIndex = Math.floor(Math.random() * availableTasks.length)
    return availableTasks[randomIndex]
  }, [completedTasks])

  const generateNewTask = useCallback(() => {
    setLoading(true)
    setError(null)

    try {
      const newTask = getNextTask()
      setTask(newTask)
      setCurrentTaskStartTime(null)
    } catch (err) {
      console.error('Failed to generate new task:', err)
      setError('新しいタスクの生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [getNextTask])

  const fetchTodayTask = useCallback(async () => {
    setLoading(true)
    setError(null)

    // ローカルタスク生成のみを使用（APIは無効化）
    generateNewTask()
  }, [generateNewTask])

  const handleTaskSelect = useCallback((selectedTask: Task) => {
    console.log('Task selected:', selectedTask)
    setCurrentTaskStartTime(Date.now())
    // タスク選択時の処理（タイマー開始など）
  }, [])

  const handleTaskComplete = useCallback(async (taskId: string, duration: number, result: any) => {
    console.log('Task completed:', taskId)

    const actualDuration = duration ||
      (currentTaskStartTime ? Math.floor((Date.now() - currentTaskStartTime) / 1000) : 60)

    // タスク情報を取得
    const completedTask = taskPool.find(t => t.id === taskId)
    if (!completedTask) {
      console.error('Task not found:', taskId)
      return
    }

    // ローカル進捗記録
    recordTaskCompletion(completedTask.id, completedTask.category, actualDuration)

    // 完了タスクリストに追加
    setCompletedTasks(prev => [...prev, completedTask.id])

    // API送信は無効化（ローカル進捗記録のみ）
    console.log('Task completed locally:', completedTask.id, 'Duration:', actualDuration)

    // 次のタスクを生成
    setTimeout(() => {
      generateNewTask()
    }, 1500) // アニメーション時間を考慮
  }, [currentTaskStartTime, recordTaskCompletion, generateNewTask])

  const handleTaskSkip = useCallback((skippedTask: Task) => {
    console.log('Task skipped:', skippedTask)

    // スキップしたタスクも完了リストに追加（再表示を避けるため）
    setCompletedTasks(prev => [...prev, skippedTask.id])

    // 次のタスクを生成
    generateNewTask()
  }, [generateNewTask])

  return {
    task,
    loading,
    error,
    completedTasks,
    currentTaskStartTime,
    fetchTodayTask,
    generateNewTask,
    handleTaskSelect,
    handleTaskComplete,
    handleTaskSkip,
    getNextTask
  }
}