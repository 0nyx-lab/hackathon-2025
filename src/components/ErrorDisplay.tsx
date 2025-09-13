'use client'

import { memo, useCallback } from 'react'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  className?: string
}

function ErrorDisplayComponent({ error, onRetry, className = '' }: ErrorDisplayProps) {
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry()
    }
  }, [onRetry])

  return (
    <div className={`text-center ${className}`}>
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        エラーが発生しました
      </h2>
      <p className="text-gray-600 mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={handleRetry}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  )
}

export const ErrorDisplay = memo(ErrorDisplayComponent)