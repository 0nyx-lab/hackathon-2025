import OpenAI from 'openai'
import { TodayTask, User, Activity } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
})

// AI推薦エンジン
export async function generateTaskRecommendations(
  user: User,
  recentActivities: Activity[],
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): Promise<TodayTask[]> {
  try {
    const systemPrompt = `
あなたは学習・成長支援AIです。ユーザーの状況に応じて最適な1分タスクを推薦してください。

ユーザー情報:
- ニックネーム: ${user.nickname || 'ユーザー'}
- カテゴリ優先度: ${JSON.stringify(user.category_preferences)}
- 時間帯: ${timeOfDay}

最近の活動:
${recentActivities.map(a => `- ${a.category_id}: ${a.task_title} (${a.duration_seconds}秒)`).join('\n')}

以下の形式で3-5個のタスクを推薦してください:
{
  "tasks": [
    {
      "id": "task_unique_id",
      "category": "学習|仕事|生活|健康",
      "title": "タスクタイトル",
      "description": "詳細説明",
      "estimated_seconds": 60,
      "difficulty": "easy|medium|hard",
      "content": "具体的な内容や指示"
    }
  ]
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '今日の1分タスクを推薦してください。' }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('AI response is empty')

    const parsed = JSON.parse(content)
    return parsed.tasks || []
  } catch (error) {
    console.error('AI recommendation failed:', error)
    return getFallbackTasks(timeOfDay)
  }
}

// フォールバック用定型タスク
export function getFallbackTasks(timeOfDay: 'morning' | 'afternoon' | 'evening'): TodayTask[] {
  const tasks: Record<string, TodayTask[]> = {
    morning: [
      {
        id: 'morning_learning_001',
        category: '学習',
        title: '英単語1個覚える',
        description: '今日覚える英単語を1つ選んで記憶に定着させましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: 'Innovation = 革新、新しいアイデアや方法を生み出すこと'
      },
      {
        id: 'morning_health_001',
        category: '健康',
        title: '朝のストレッチ',
        description: '1分間の軽いストレッチで体を目覚めさせましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: '首回し、肩回し、背伸びをゆっくりと行う'
      }
    ],
    afternoon: [
      {
        id: 'afternoon_work_001',
        category: '仕事',
        title: '効率化アイデア',
        description: '現在の作業を効率化する方法を1つ考えてみましょう',
        estimated_seconds: 60,
        difficulty: 'medium',
        content: '今日の作業で時間がかかっている部分を特定し、改善案を考える'
      },
      {
        id: 'afternoon_life_001',
        category: '生活',
        title: '整理整頓',
        description: 'デスク周りを1分間で整理しましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: '不要な書類を片付け、必要なものを適切な場所に配置する'
      }
    ],
    evening: [
      {
        id: 'evening_learning_001',
        category: '学習',
        title: '今日の振り返り',
        description: '今日学んだことを1つ振り返ってまとめましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: '今日の経験から得た学びを1つ選び、簡潔にまとめる'
      },
      {
        id: 'evening_health_001',
        category: '健康',
        title: '深呼吸',
        description: '1分間の深呼吸でリラックスしましょう',
        estimated_seconds: 60,
        difficulty: 'easy',
        content: '4秒吸って、4秒止めて、4秒吐く。これを3回繰り返す'
      }
    ]
  }

  return tasks[timeOfDay] || tasks.morning
}

// 時間帯判定
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}
