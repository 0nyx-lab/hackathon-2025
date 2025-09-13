// パフォーマンス測定とモニタリング

// パフォーマンス測定デコレータ
export function measureTime<T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = fn(...args)
    
    if (result instanceof Promise) {
      return result.then((res) => {
        const end = performance.now()
        console.log(`${label || fn.name}: ${(end - start).toFixed(2)}ms`)
        return res
      })
    } else {
      const end = performance.now()
      console.log(`${label || fn.name}: ${(end - start).toFixed(2)}ms`)
      return result
    }
  }) as T
}

// パフォーマンスマーカー
export class PerformanceMarker {
  private markers: Map<string, number> = new Map()

  mark(name: string): void {
    this.markers.set(name, performance.now())
  }

  measure(name: string, startMark?: string): number {
    const endTime = performance.now()
    const startTime = startMark ? this.markers.get(startMark) : undefined
    
    if (startTime === undefined) {
      console.warn(`Start mark '${startMark}' not found`)
      return 0
    }
    
    const duration = endTime - startTime
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    return duration
  }

  clear(): void {
    this.markers.clear()
  }
}

// シングルトンパフォーマンスマーカー
export const perfMarker = new PerformanceMarker()

// レスポンス時間測定
export function measureResponseTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; responseTime: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const responseTime = performance.now() - startTime
      
      console.log(`${label}: ${responseTime.toFixed(2)}ms`)
      resolve({ result, responseTime })
    } catch (error) {
      const responseTime = performance.now() - startTime
      console.error(`${label}: ${responseTime.toFixed(2)}ms (ERROR)`)
      reject(error)
    }
  })
}

// バッチ処理最適化
export async function batchProcess<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await processor(batch)
    results.push(...batchResults)
  }
  
  return results
}

// 並列処理制限
export async function parallelLimit<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  limit: number = 5
): Promise<R[]> {
  const results: R[] = []
  const executing: Promise<void>[] = []
  
  for (const item of items) {
    const promise = processor(item).then(result => {
      results.push(result)
    })
    
    executing.push(promise)
    
    if (executing.length >= limit) {
      await Promise.race(executing)
      executing.splice(executing.findIndex(p => p === promise), 1)
    }
  }
  
  await Promise.all(executing)
  return results
}

// デバウンス
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// スロットル
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

// メモ化
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// リソースプール
export class ResourcePool<T> {
  private available: T[] = []
  private inUse: Set<T> = new Set()
  private maxSize: number

  constructor(resources: T[], maxSize: number = 10) {
    this.available = [...resources]
    this.maxSize = maxSize
  }

  async acquire(): Promise<T | null> {
    if (this.available.length > 0) {
      const resource = this.available.pop()!
      this.inUse.add(resource)
      return resource
    }
    
    if (this.inUse.size < this.maxSize) {
      // 新しいリソースを作成（実装は呼び出し元に委譲）
      return null
    }
    
    // リソースが利用可能になるまで待機
    return new Promise((resolve) => {
      const check = () => {
        if (this.available.length > 0) {
          const resource = this.available.pop()!
          this.inUse.add(resource)
          resolve(resource)
        } else {
          setTimeout(check, 10)
        }
      }
      check()
    })
  }

  release(resource: T): void {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource)
      this.available.push(resource)
    }
  }

  get stats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    }
  }
}

// パフォーマンス監視
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, [])
    }
    
    const values = this.metrics.get(metric)!
    values.push(value)
    
    // 最新1000件のみ保持
    if (values.length > 1000) {
      values.splice(0, values.length - 1000)
    }
  }

  getStats(metric: string): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const values = this.metrics.get(metric)
    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const count = sorted.length
    const min = sorted[0]
    const max = sorted[count - 1]
    const avg = sorted.reduce((sum, val) => sum + val, 0) / count
    const p50 = sorted[Math.floor(count * 0.5)]
    const p95 = sorted[Math.floor(count * 0.95)]
    const p99 = sorted[Math.floor(count * 0.99)]

    return { count, min, max, avg, p50, p95, p99 }
  }

  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const metric of this.metrics.keys()) {
      stats[metric] = this.getStats(metric)
    }
    
    return stats
  }

  clear(): void {
    this.metrics.clear()
  }
}

// グローバルパフォーマンスモニター
export const perfMonitor = new PerformanceMonitor()

// パフォーマンス測定ミドルウェア
export function performanceMiddleware(
  req: Request,
  handler: (req: Request) => Promise<Response>
): Promise<Response> {
  return measureResponseTime(
    () => handler(req),
    `${req.method} ${new URL(req.url).pathname}`
  ).then(({ result, responseTime }) => {
    perfMonitor.record('api_response_time', responseTime)
    return result
  })
}
