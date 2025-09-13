// API型定義
export interface TodayTask {
  id: string
  category: string
  title: string
  description: string
  estimated_seconds: number
  difficulty: 'easy' | 'medium' | 'hard'
  content?: string
}

export interface TodayResponse {
  user_id: string
  cards: TodayTask[]
  recommendations: {
    primary: string
    balance_suggestion?: string
  }
}

export interface SubmitRequest {
  task_id: string
  duration_seconds: number
  result: {
    completed: boolean
    confidence: 'low' | 'medium' | 'high'
  }
  timestamp: string
}

export interface SubmitResponse {
  success: boolean
  badges_earned: string[]
  streak_updated: number
  next_suggestion: string
}

export interface DashboardData {
  daily_summary: {
    total_minutes: number
    categories_active: string[]
    streak_days: number
  }
  weekly_trend: Array<{
    date: string
    minutes: number
  }>
  badges: {
    continuity: number
    challenge: number
    balance: number
  }
}

// バッジ型定義
export interface Badge {
  type: 'continuity' | 'challenge' | 'balance'
  level: number
  name: string
  description: string
  condition: string
}

export interface BadgeEarned {
  id: string
  user_id: string
  badge_type: string
  level: number
  category_id?: string | null
  earned_at: string
  metadata?: Record<string, any>
}

// ユーザー型定義
export interface User {
  id: string
  nickname?: string
  category_preferences: Record<string, any>
  timezone: string
  created_at: string
  updated_at: string
}

// アクティビティ型定義
export interface Activity {
  id: string
  user_id: string
  category_id: string
  task_title: string
  task_description?: string
  started_at?: string
  completed_at: string
  duration_seconds?: number
  result_data?: Record<string, any>
  source: 'app' | 'import'
  created_at: string
}

// カテゴリ型定義
export interface Category {
  id: string
  name: string
  icon_name?: string
  color_code?: string
  description?: string
}

// 成長指標型定義
export interface GrowthMetric {
  user_id: string
  date: string
  category_id: string
  total_minutes: number
  activity_count: number
  streak_days: number
  balance_score: number
  updated_at: string
}

// エラー型定義
export interface ApiError {
  error: string
  message: string
  status: number
}

// フロントエンド用型定義
export interface Task extends TodayTask {
  // フロントエンドで使用する追加プロパティ
}

// フォールバック用モックデータ
export interface MockData {
  today: TodayResponse
  dashboard: DashboardData
  tasks: TodayTask[]
}
