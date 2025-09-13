import React from 'react'
import { useProgress } from '@/hooks/useProgress'

export const HistoryList: React.FC = () => {
  const { completedTasks } = useProgress()
  const recent = [...completedTasks].slice(-5).reverse()

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-sm text-gray-500 text-center">
        まだ完了記録がありません
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">最近の完了</h3>
      <ul className="space-y-2 text-sm">
        {recent.map(item => (
          <li key={item.id} className="flex items-center justify-between">
            <span className="text-gray-700">{item.taskId}</span>
            <span className="text-gray-400">{new Date(item.completedAt).toLocaleTimeString('ja-JP')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
