import React, { useMemo } from 'react'
import { useProgress } from '@/hooks/useProgress'

export const ProgressWidget: React.FC = () => {
  const { todayCompleted, totalCompleted, currentStreak, categoryStats } = useProgress()

  const categories = useMemo(() => Object.entries(categoryStats || {}), [categoryStats])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{todayCompleted}</div>
          <div className="text-xs text-gray-500">今日完了</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
          <div className="text-xs text-gray-500">連続日数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{totalCompleted}</div>
          <div className="text-xs text-gray-500">合計完了</div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {categories.map(([cat, count]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{cat}</span>
                <span>{count as number}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(100, Number(count) * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
