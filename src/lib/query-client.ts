import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // データが古いとみなされるまでの時間（5分）
      staleTime: 5 * 60 * 1000,
      // キャッシュ保持時間（10分）
      gcTime: 10 * 60 * 1000,
      // 自動リフェッチ無効化（手動制御）
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // エラー時の再試行
      retry: 1,
      retryDelay: 1000
    }
  }
})
