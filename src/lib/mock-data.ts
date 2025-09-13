import { TodayResponse, DashboardData, TodayTask, MockData } from '@/types'

// フォールバック用モックデータ
export const MOCK_DATA: MockData = {
  today: {
    user_id: 'demo_user_001',
    cards: [
      {
        id: 'mock_learning_001',
        category: '学習',
        title: '英単語1個覚える',
        description: '今日覚える英単語を1つ選んで記憶に定着させましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: 'Innovation = 革新、新しいアイデアや方法を生み出すこと'
      },
      {
        id: 'mock_health_001',
        category: '健康',
        title: '朝のストレッチ',
        description: '1分間の軽いストレッチで体を目覚めさせましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: '首回し、肩回し、背伸びをゆっくりと行う'
      },
      {
        id: 'mock_work_001',
        category: '仕事',
        title: '効率化アイデア',
        description: '現在の作業を効率化する方法を1つ考えてみましょう',
        estimated_seconds: 60,
        difficulty: 'medium',
        content: '今日の作業で時間がかかっている部分を特定し、改善案を考える'
      }
    ],
    recommendations: {
      primary: '学習',
      balance_suggestion: '健康カテゴリが不足気味です'
    }
  },
  dashboard: {
    daily_summary: {
      total_minutes: 3,
      categories_active: ['学習', '健康'],
      streak_days: 5
    },
    weekly_trend: [
      { date: '2025-09-05', minutes: 2 },
      { date: '2025-09-06', minutes: 4 },
      { date: '2025-09-07', minutes: 3 },
      { date: '2025-09-08', minutes: 5 },
      { date: '2025-09-09', minutes: 2 },
      { date: '2025-09-10', minutes: 3 },
      { date: '2025-09-11', minutes: 3 }
    ],
    badges: {
      continuity: 2,
      challenge: 1,
      balance: 3
    }
  },
  tasks: [
    {
      id: 'mock_learning_001',
      category: '学習',
      title: '英単語1個覚える',
      description: '今日覚える英単語を1つ選んで記憶に定着させましょう',
      estimated_seconds: 60,
      difficulty: 'easy',
      content: 'Innovation = 革新、新しいアイデアや方法を生み出すこと'
    },
    {
      id: 'mock_learning_002',
      category: '学習',
      title: 'プログラミング概念',
      description: '新しいプログラミング概念を1つ学びましょう',
      estimated_seconds: 60,
      difficulty: 'medium',
      content: 'Closure: 関数が定義された時のスコープを保持する仕組み'
    },
    {
      id: 'mock_health_001',
      category: '健康',
      title: '朝のストレッチ',
      description: '1分間の軽いストレッチで体を目覚めさせましょう',
      estimated_seconds: 60,
      difficulty: 'easy',
      content: '首回し、肩回し、背伸びをゆっくりと行う'
    },
    {
      id: 'mock_health_002',
      category: '健康',
      title: '深呼吸',
      description: '1分間の深呼吸でリラックスしましょう',
      estimated_seconds: 60,
      difficulty: 'easy',
      content: '4秒吸って、4秒止めて、4秒吐く。これを3回繰り返す'
    },
    {
      id: 'mock_work_001',
      category: '仕事',
      title: '効率化アイデア',
      description: '現在の作業を効率化する方法を1つ考えてみましょう',
      estimated_seconds: 60,
      difficulty: 'medium',
      content: '今日の作業で時間がかかっている部分を特定し、改善案を考える'
    },
    {
      id: 'mock_work_002',
      category: '仕事',
      title: 'スキルアップ計画',
      description: '今週身につけたいスキルを1つ選んで計画を立てましょう',
      estimated_seconds: 60,
      difficulty: 'medium',
      content: '現在のスキルレベルを確認し、次に習得すべきスキルを特定する'
    },
    {
      id: 'mock_life_001',
      category: '生活',
      title: '整理整頓',
      description: 'デスク周りを1分間で整理しましょう',
      estimated_seconds: 60,
      difficulty: 'easy',
      content: '不要な書類を片付け、必要なものを適切な場所に配置する'
    },
    {
      id: 'mock_life_002',
      category: '生活',
      title: '今日の振り返り',
      description: '今日学んだことを1つ振り返ってまとめましょう',
      estimated_seconds: 60,
      difficulty: 'easy',
      content: '今日の経験から得た学びを1つ選び、簡潔にまとめる'
    }
  ]
}

// デモ用固定レスポンス
export function getMockTodayResponse(): TodayResponse {
  return MOCK_DATA.today
}

export function getMockDashboardData(): DashboardData {
  return MOCK_DATA.dashboard
}

export function getMockTasks(): TodayTask[] {
  return MOCK_DATA.tasks
}

// 時間帯に応じたタスク推薦
export function getMockTasksByTime(timeOfDay: 'morning' | 'afternoon' | 'evening'): TodayTask[] {
  const timeBasedTasks: Record<string, TodayTask[]> = {
    morning: MOCK_DATA.tasks.filter(t => 
      t.category === '学習' || t.category === '健康'
    ),
    afternoon: MOCK_DATA.tasks.filter(t => 
      t.category === '仕事' || t.category === '生活'
    ),
    evening: MOCK_DATA.tasks.filter(t => 
      t.category === '学習' || t.category === '健康'
    )
  }
  
  return timeBasedTasks[timeOfDay] || MOCK_DATA.tasks
}
