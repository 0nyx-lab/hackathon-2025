import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // モック統計データ
    const mockStats = {
      totalTasks: 15,
      completedToday: 3,
      currentStreak: 5,
      totalPoints: 450,
      categories: {
        health: { completed: 4, total: 6 },
        learning: { completed: 3, total: 4 },
        productivity: { completed: 2, total: 3 },
        relationships: { completed: 2, total: 2 },
        creativity: { completed: 4, total: 5 }
      },
      recentActivities: [
        {
          id: '1',
          title: '深呼吸を3回する',
          category: 'health',
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          points: 10
        },
        {
          id: '2',
          title: '感謝のメッセージを送る',
          category: 'relationships', 
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          points: 15
        },
        {
          id: '3',
          title: 'デスクを片付ける',
          category: 'productivity',
          completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          points: 20
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: mockStats
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}