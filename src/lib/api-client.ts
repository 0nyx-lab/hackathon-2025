import { TodayResponse, SubmitRequest, SubmitResponse, DashboardData, ApiError } from '@/types'

// API ベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// HTTP クライアント
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // 今日のタスク取得
  async getTodayTasks(userId?: string): Promise<TodayResponse> {
    const params = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    return this.request<TodayResponse>(`/today${params}`)
  }

  // タスク実行結果送信
  async submitTask(
    taskData: SubmitRequest,
    userId?: string
  ): Promise<SubmitResponse> {
    const params = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    
    return this.request<SubmitResponse>(`/submit${params}`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  // ダッシュボードデータ取得
  async getDashboardData(userId?: string): Promise<DashboardData> {
    const params = userId ? `?user_id=${encodeURIComponent(userId)}` : ''
    return this.request<DashboardData>(`/dashboard${params}`)
  }

  // ヘルスチェック
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

// 使用例とヘルパー関数
export async function fetchTodayTasks(userId?: string): Promise<TodayResponse> {
  try {
    return await apiClient.getTodayTasks(userId)
  } catch (error) {
    console.error('Failed to fetch today tasks:', error)
    throw error
  }
}

export async function submitTaskResult(
  taskId: string,
  durationSeconds: number,
  completed: boolean,
  confidence: 'low' | 'medium' | 'high' = 'medium',
  userId?: string
): Promise<SubmitResponse> {
  try {
    const submitData: SubmitRequest = {
      task_id: taskId,
      duration_seconds: durationSeconds,
      result: {
        completed,
        confidence,
      },
      timestamp: new Date().toISOString(),
    }

    return await apiClient.submitTask(submitData, userId)
  } catch (error) {
    console.error('Failed to submit task result:', error)
    throw error
  }
}

export async function fetchDashboardData(userId?: string): Promise<DashboardData> {
  try {
    return await apiClient.getDashboardData(userId)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    throw error
  }
}

// エラーハンドリング用ヘルパー
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'error' in error && 'status' in error
}

export function getErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// リトライ機能付きリクエスト
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }
      
      // 指数バックオフ
      const delay = delayMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// キャッシュ機能付きリクエスト
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5分

export async function cachedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  try {
    const data = await requestFn()
    cache.set(key, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    // キャッシュがあればそれを使用
    if (cached) {
      return cached.data
    }
    throw error
  }
}

// キャッシュクリア
export function clearCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}
