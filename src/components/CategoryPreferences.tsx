import React, { useMemo } from 'react'
import { taskCategories } from '@/data/tasks'
import { useLocalStorage } from '@/hooks/useStorage'

export type CategoryPrefs = Record<string, boolean>

const DEFAULT_PREFS: CategoryPrefs = taskCategories.reduce((acc: CategoryPrefs, c) => {
  acc[c.id] = true
  return acc
}, {} as CategoryPrefs)

export const CategoryPreferences: React.FC<{ onChange?: (prefs: CategoryPrefs) => void }> = ({ onChange }) => {
  const [prefs, setPrefs] = useLocalStorage<CategoryPrefs>('steppy_category_prefs', DEFAULT_PREFS)

  const list = useMemo(() => taskCategories.map(c => ({ id: c.id, name: c.name, icon: c.icon })), [])

  const toggle = (id: string) => {
    const next = { ...prefs, [id]: !prefs[id] }
    setPrefs(next)
    onChange?.(next)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">好みのカテゴリ</h3>
      <div className="grid grid-cols-2 gap-2">
        {list.map(c => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${prefs[c.id] ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
