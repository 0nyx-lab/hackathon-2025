import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 初回レンダリング時にローカルストレージから値を読み込み
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue])

  // 値を設定してローカルストレージに保存
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // 値を削除
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      setStoredValue(initialValue)
    }
  }, [key, initialValue])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

// ストレージ操作のユーティリティ関数
export const storageUtils = {
  // 複数のキーを一度にクリア
  clearMultiple: (keys: string[], storage: Storage = localStorage) => {
    keys.forEach(key => {
      try {
        storage.removeItem(key)
      } catch (error) {
        console.error(`Error removing key "${key}":`, error)
      }
    })
  },

  // ストレージサイズを取得
  getStorageSize: (storage: Storage = localStorage) => {
    let total = 0
    for (const key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += storage[key].length + key.length
      }
    }
    return total
  },

  // JSONで安全にパース
  safeJsonParse: <T>(value: string | null, fallback: T): T => {
    if (!value) return fallback
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  },

  // 指定したプレフィックスのキーをすべて取得
  getKeysByPrefix: (prefix: string, storage: Storage = localStorage) => {
    const keys = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key)
      }
    }
    return keys
  },

  // ストレージの内容をオブジェクトとしてエクスポート
  exportStorage: (storage: Storage = localStorage) => {
    const data: Record<string, any> = {}
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        try {
          data[key] = JSON.parse(storage.getItem(key) || '')
        } catch {
          data[key] = storage.getItem(key)
        }
      }
    }
    return data
  },

  // オブジェクトからストレージにインポート
  importStorage: (data: Record<string, any>, storage: Storage = localStorage) => {
    Object.entries(data).forEach(([key, value]) => {
      try {
        storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      } catch (error) {
        console.error(`Error importing key "${key}":`, error)
      }
    })
  }
}