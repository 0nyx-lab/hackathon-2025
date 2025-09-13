import { NextResponse } from 'next/server'

const mockTasks = [
  {
    id: '1',
    category: 'health',
    title: '深呼吸を3回する',
    description: 'ゆっくりと鼻から吸って、口から吐く深呼吸を3回繰り返してください。',
    estimatedTime: 1,
    source: 'mock'
  },
  {
    id: '2', 
    category: 'learning',
    title: '新しい単語を1つ調べる',
    description: '今日出会った知らない単語を1つ辞書で調べて意味を覚えましょう。',
    estimatedTime: 1,
    source: 'mock'
  },
  {
    id: '3',
    category: 'productivity', 
    title: 'デスクを片付ける',
    description: '机の上のものを整理して、明日の作業がしやすい環境を作りましょう。',
    estimatedTime: 1,
    source: 'mock'
  },
  {
    id: '4',
    category: 'relationships',
    title: '感謝のメッセージを送る',
    description: '家族や友人に「ありがとう」のメッセージを1つ送ってみましょう。',
    estimatedTime: 1,
    source: 'mock'
  },
  {
    id: '5',
    category: 'creativity',
    title: '今日の出来事を3行で書く',
    description: '今日あった良いことを3行の短い文章で書き留めてみましょう。',
    estimatedTime: 1,
    source: 'mock'
  }
]

export async function GET() {
  try {
    // ランダムにタスクを選択
    const randomTask = mockTasks[Math.floor(Math.random() * mockTasks.length)]
    
    return NextResponse.json({
      success: true,
      task: randomTask
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}