// 簡易キャッシュシステム（メモリベース）
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// グローバルキャッシュインスタンス
export const cache = new MemoryCache()

// キャッシュキー生成
export const CACHE_KEYS = {
  TODAY_TASKS: (userId: string) => `today_tasks:${userId}`,
  DASHBOARD: (userId: string) => `dashboard:${userId}`,
  USER: (userId: string) => `user:${userId}`,
  ACTIVITIES: (userId: string, days: number) => `activities:${userId}:${days}`,
  BADGES: (userId: string) => `badges:${userId}`
}

// キャッシュ付き関数ラッパー
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60000
): Promise<T> {
  // キャッシュから取得を試行
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // キャッシュにない場合は取得してキャッシュに保存
  const data = await fetchFn()
  cache.set(key, data, ttl)
  return data
}

// キャッシュ無効化
export function invalidateCache(pattern: string): void {
  // 簡易実装：パターンマッチングでキーを削除
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// ユーザー関連キャッシュの無効化
export function invalidateUserCache(userId: string): void {
  invalidateCache(userId)
}