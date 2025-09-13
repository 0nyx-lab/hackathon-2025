import { Task } from '@/types'

export const taskCategories = [
  {
    id: 'health',
    name: '健康',
    icon: '💪',
    color: 'bg-green-500',
    description: '身体的・精神的健康を向上させるタスク'
  },
  {
    id: 'learning',
    name: '学習',
    icon: '📚',
    color: 'bg-blue-500',
    description: '知識やスキルを習得するタスク'
  },
  {
    id: 'productivity',
    name: '生産性',
    icon: '⚡',
    color: 'bg-yellow-500',
    description: '効率性や成果を向上させるタスク'
  },
  {
    id: 'relationship',
    name: '人間関係',
    icon: '🤝',
    color: 'bg-pink-500',
    description: '人とのつながりを深めるタスク'
  },
  {
    id: 'creativity',
    name: '創造性',
    icon: '🎨',
    color: 'bg-purple-500',
    description: '創造力や表現力を高めるタスク'
  },
  {
    id: 'mindfulness',
    name: 'マインドフルネス',
    icon: '🧘',
    color: 'bg-indigo-500',
    description: '心の平穏と集中力を育むタスク'
  }
]

export const taskPool: Task[] = [
  // 健康カテゴリ
  {
    id: 'health_01',
    category: 'health',
    title: '深呼吸',
    description: '1分間の深呼吸で心を落ち着かせましょう',
    estimated_seconds: 60,
    difficulty: 'easy'
  },
  {
    id: 'health_02',
    category: 'health',
    title: 'スクワット10回',
    description: '正しいフォームで10回スクワットをしましょう',
    estimated_seconds: 60,
    difficulty: 'easy'
  },
  {
    id: 'health_03',
    category: 'health',
    title: 'ストレッチ',
    description: '肩と首をゆっくりストレッチしましょう',
    estimated_seconds: 120,
    difficulty: 'easy'
  },
  {
    id: 'health_04',
    category: 'health',
    title: '水分補給',
    description: 'コップ一杯の水をゆっくり飲みましょう',
    estimated_seconds: 30,
    difficulty: 'easy'
  },
  {
    id: 'health_05',
    category: 'health',
    title: '腕立て伏せ',
    description: '5回の腕立て伏せで上半身を鍛えましょう',
    estimated_seconds: 60,
    difficulty: 'medium'
  },

  // 学習カテゴリ
  {
    id: 'learning_01',
    category: 'learning',
    title: '新しい単語',
    description: '今日の新しい単語を1つ調べて覚えましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'learning_02',
    category: 'learning',
    title: 'ニュース記事',
    description: '興味のある分野のニュース記事を1つ読みましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },
  {
    id: 'learning_03',
    category: 'learning',
    title: 'YouTubeで学習',
    description: 'お気に入りの教育チャンネルで短い動画を見ましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },
  {
    id: 'learning_04',
    category: 'learning',
    title: 'メモ整理',
    description: '昨日学んだことを3行でまとめてみましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'learning_05',
    category: 'learning',
    title: 'スキルアップ',
    description: '仕事に関連するスキルについて5分間調べましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },

  // 生産性カテゴリ
  {
    id: 'productivity_01',
    category: 'productivity',
    title: 'タスク整理',
    description: '今日のタスクを重要度順に並べ替えましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'productivity_02',
    category: 'productivity',
    title: 'デスク掃除',
    description: '作業スペースを1分間で整理しましょう',
    estimated_seconds: 60,
    difficulty: 'easy'
  },
  {
    id: 'productivity_03',
    category: 'productivity',
    title: 'メール整理',
    description: '受信トレイの不要なメールを5つ削除しましょう',
    estimated_seconds: 120,
    difficulty: 'easy'
  },
  {
    id: 'productivity_04',
    category: 'productivity',
    title: '明日の準備',
    description: '明日の重要なタスクを3つリストアップしましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'productivity_05',
    category: 'productivity',
    title: '時間管理',
    description: 'ポモドーロテクニックで25分集中しましょう',
    estimated_seconds: 1500,
    difficulty: 'hard'
  },

  // 人間関係カテゴリ
  {
    id: 'relationship_01',
    category: 'relationship',
    title: '感謝メッセージ',
    description: '大切な人に感謝のメッセージを送りましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'relationship_02',
    category: 'relationship',
    title: '家族との時間',
    description: '家族と5分間会話しましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },
  {
    id: 'relationship_03',
    category: 'relationship',
    title: '友人に連絡',
    description: 'しばらく連絡していない友人に挨拶しましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'relationship_04',
    category: 'relationship',
    title: '同僚との雑談',
    description: '同僚と軽い雑談を楽しみましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },
  {
    id: 'relationship_05',
    category: 'relationship',
    title: '新しい人との出会い',
    description: 'コミュニティイベントを1つ探してみましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },

  // 創造性カテゴリ
  {
    id: 'creativity_01',
    category: 'creativity',
    title: 'スケッチ',
    description: '目の前にあるものを簡単にスケッチしましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },
  {
    id: 'creativity_02',
    category: 'creativity',
    title: '短文創作',
    description: '今の気持ちを3行の詩で表現しましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },
  {
    id: 'creativity_03',
    category: 'creativity',
    title: '写真撮影',
    description: '身の回りの美しいものを1枚撮影しましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'creativity_04',
    category: 'creativity',
    title: 'アイデア出し',
    description: '日常の問題を解決するアイデアを3つ考えましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },
  {
    id: 'creativity_05',
    category: 'creativity',
    title: '音楽鑑賞',
    description: '新しいジャンルの音楽を1曲聴いてみましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },

  // マインドフルネスカテゴリ
  {
    id: 'mindfulness_01',
    category: 'mindfulness',
    title: '瞑想',
    description: '5分間の瞑想で心を静めましょう',
    estimated_seconds: 300,
    difficulty: 'medium'
  },
  {
    id: 'mindfulness_02',
    category: 'mindfulness',
    title: '感謝日記',
    description: '今日感謝したことを3つ書き出しましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  },
  {
    id: 'mindfulness_03',
    category: 'mindfulness',
    title: '今に集中',
    description: '1分間、今この瞬間に意識を向けましょう',
    estimated_seconds: 60,
    difficulty: 'easy'
  },
  {
    id: 'mindfulness_04',
    category: 'mindfulness',
    title: '自然観察',
    description: '窓から見える自然を5分間観察しましょう',
    estimated_seconds: 300,
    difficulty: 'easy'
  },
  {
    id: 'mindfulness_05',
    category: 'mindfulness',
    title: '振り返り',
    description: '今日の良かった出来事を思い返しましょう',
    estimated_seconds: 180,
    difficulty: 'easy'
  }
]

export function getRandomTask(): Task {
  const randomIndex = Math.floor(Math.random() * taskPool.length)
  return taskPool[randomIndex]
}

export function getTasksByCategory(categoryId: string): Task[] {
  return taskPool.filter(task => task.category === categoryId)
}

export function getTaskById(taskId: string): Task | undefined {
  return taskPool.find(task => task.id === taskId)
}

export function getCategoryInfo(categoryId: string) {
  return taskCategories.find(cat => cat.id === categoryId)
}