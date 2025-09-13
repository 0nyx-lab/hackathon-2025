import { useState, useEffect, useCallback } from 'react'

export interface ProgressData {
  totalCompleted: number
  todayCompleted: number
  currentStreak: number
  categoryStats: Record<string, number>
  weeklyActivity: Array<{ date: string; count: number }>
  completedTasks: Array<{
    id: string
    taskId: string
    completedAt: string
    category: string
    duration: number
  }>
}

export interface ProgressActions {
  recordTaskCompletion: (taskId: string, category: string, duration: number) => void
  getCompletionStats: () => {
    today: number
    thisWeek: number
    total: number
    streak: number
  }
  getCategoryProgress: () => Record<string, number>
  resetProgress: () => void
}

const STORAGE_KEY = 'steppy_progress'

export function useProgress(): ProgressData & ProgressActions {
  const [progressData, setProgressData] = useState<ProgressData>({
    totalCompleted: 0,
    todayCompleted: 0,
    currentStreak: 0,
    categoryStats: {},
    weeklyActivity: [],
    completedTasks: []
  })

  // ローカルストレージからデータを読み込み
  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // 今日の完了数を再計算
        const today = new Date().toDateString()
        const todayTasks = data.completedTasks?.filter((task: any) =>
          new Date(task.completedAt).toDateString() === today
        ) || []

        setProgressData({
          ...data,
          todayCompleted: todayTasks.length,
          currentStreak: calculateStreak(data.completedTasks || [])
        })
      }
    } catch (error) {
      console.error('Failed to load progress data:', error)
    }
  }, [])

  // ローカルストレージにデータを保存
  const saveProgress = useCallback((data: ProgressData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save progress data:', error)
    }
  }, [])

  // 連続日数を計算
  const calculateStreak = useCallback((completedTasks: any[]) => {
    if (!completedTasks.length) return 0

    const dates = [...new Set(completedTasks.map(task =>
      new Date(task.completedAt).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    if (!dates.length) return 0

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    // 今日または昨日にタスクが完了していない場合、ストリークは0
    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 0
    let currentDate = new Date()

    for (const dateStr of dates) {
      const taskDate = new Date(dateStr)
      const diffDays = Math.floor((currentDate.getTime() - taskDate.getTime()) / (24 * 60 * 60 * 1000))

      if (diffDays === streak) {
        streak++
        currentDate = taskDate
      } else {
        break
      }
    }

    return streak
  }, [])

  // 週次アクティビティデータを生成
  const generateWeeklyActivity = useCallback((completedTasks: any[]) => {
    const weeklyData = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toDateString()

      const count = completedTasks.filter(task =>
        new Date(task.completedAt).toDateString() === dateStr
      ).length

      weeklyData.push({
        date: date.toISOString().split('T')[0],
        count
      })
    }

    return weeklyData
  }, [])

  // タスク完了を記録
  const recordTaskCompletion = useCallback((taskId: string, category: string, duration: number) => {
    const completion = {
      id: Date.now().toString(),
      taskId,
      completedAt: new Date().toISOString(),
      category,
      duration
    }

    setProgressData(prev => {
      const newCompletedTasks = [...prev.completedTasks, completion]
      const newCategoryStats = { ...prev.categoryStats }
      newCategoryStats[category] = (newCategoryStats[category] || 0) + 1

      const today = new Date().toDateString()
      const todayTasks = newCompletedTasks.filter(task =>
        new Date(task.completedAt).toDateString() === today
      )

      const newData = {
        ...prev,
        totalCompleted: prev.totalCompleted + 1,
        todayCompleted: todayTasks.length,
        currentStreak: calculateStreak(newCompletedTasks),
        categoryStats: newCategoryStats,
        weeklyActivity: generateWeeklyActivity(newCompletedTasks),
        completedTasks: newCompletedTasks
      }

      saveProgress(newData)
      return newData
    })
  }, [calculateStreak, generateWeeklyActivity, saveProgress])

  // 完了統計を取得
  const getCompletionStats = useCallback(() => {
    const today = new Date().toDateString()
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const thisWeek = progressData.completedTasks.filter(task => {
      const taskDate = new Date(task.completedAt)
      return taskDate >= weekStart
    }).length

    return {
      today: progressData.todayCompleted,
      thisWeek,
      total: progressData.totalCompleted,
      streak: progressData.currentStreak
    }
  }, [progressData])

  // カテゴリ別進捗を取得
  const getCategoryProgress = useCallback(() => {
    return progressData.categoryStats
  }, [progressData.categoryStats])

  // 進捗をリセット
  const resetProgress = useCallback(() => {
    const emptyData: ProgressData = {
      totalCompleted: 0,
      todayCompleted: 0,
      currentStreak: 0,
      categoryStats: {},
      weeklyActivity: [],
      completedTasks: []
    }
    setProgressData(emptyData)
    saveProgress(emptyData)
  }, [saveProgress])

  // 初期化時にデータを読み込み
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    ...progressData,
    recordTaskCompletion,
    getCompletionStats,
    getCategoryProgress,
    resetProgress
  }
}