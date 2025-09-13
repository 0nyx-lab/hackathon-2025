import { NextRequest, NextResponse } from 'next/server'
import { getUser, getRecentActivities, getGrowthMetrics, getBadges } from '@/lib/database'
import { getMockDashboardData } from '@/lib/mock-data'
import { DashboardData, ApiError } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id') || 'demo_user_001'
    
    // 第1段階：通常動作
    try {
      // ユーザー情報取得
      const user = await getUser(userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      // 最近のアクティビティ取得
      const recentActivities = await getRecentActivities(userId, 7)
      
      // 成長指標取得
      const growthMetrics = await getGrowthMetrics(userId, 7)
      
      // バッジ取得
      const badges = await getBadges(userId)
      
      // ダッシュボードデータ構築
      const dashboardData = await buildDashboardData(
        user,
        recentActivities,
        growthMetrics,
        badges
      )
      
      return NextResponse.json(dashboardData)
      
    } catch (error) {
      console.warn('Primary dashboard failed, using mock data:', error)
      
      // 第2段階：モックデータ
      const mockData = getMockDashboardData()
      return NextResponse.json(mockData)
    }
    
  } catch (error) {
    console.error('Dashboard API Error:', error)
    
    const errorResponse: ApiError = {
      error: 'Internal Server Error',
      message: 'ダッシュボードデータ取得に失敗しました',
      status: 500
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// ダッシュボードデータ構築
async function buildDashboardData(
  user: any,
  activities: any[],
  metrics: any[],
  badges: any[]
): Promise<DashboardData> {
  // 今日のサマリー計算
  const today = new Date().toISOString().split('T')[0]
  const todayActivities = activities.filter(a => 
    a.completed_at.startsWith(today)
  )
  
  const totalMinutes = todayActivities.reduce((sum, a) => 
    sum + Math.ceil((a.duration_seconds || 60) / 60), 0
  )
  
  const categoriesActive = [...new Set(todayActivities.map(a => a.category_id))]
  
  // 継続日数計算
  const streakDays = await calculateStreakDays(activities)
  
  // 週間トレンド構築
  const weeklyTrend = buildWeeklyTrend(metrics)
  
  // バッジ集計
  const badgeCounts = {
    continuity: badges.filter(b => b.badge_type === 'continuity').length,
    challenge: badges.filter(b => b.badge_type === 'challenge').length,
    balance: badges.filter(b => b.badge_type === 'balance').length
  }
  
  return {
    daily_summary: {
      total_minutes: totalMinutes,
      categories_active: categoriesActive,
      streak_days: streakDays
    },
    weekly_trend: weeklyTrend,
    badges: badgeCounts
  }
}

// 継続日数計算
function calculateStreakDays(activities: any[]): number {
  if (activities.length === 0) return 0
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 日付順にソート
  const sortedActivities = activities.sort((a, b) => 
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  )
  
  // 連続日数を計算
  const uniqueDates = [...new Set(
    sortedActivities.map(a => 
      new Date(a.completed_at).toISOString().split('T')[0]
    )
  )]
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const activityDate = new Date(uniqueDates[i])
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - streak)
    
    if (activityDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++
    } else if (i === 0 && activityDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
      streak = 1
    } else {
      break
    }
  }
  
  return streak
}

// 週間トレンド構築
function buildWeeklyTrend(metrics: any[]): Array<{ date: string; minutes: number }> {
  const trend: Array<{ date: string; minutes: number }> = []
  
  // 過去7日間のデータを構築
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayMetrics = metrics.filter(m => m.date === dateStr)
    const totalMinutes = dayMetrics.reduce((sum, m) => sum + m.total_minutes, 0)
    
    trend.push({
      date: dateStr,
      minutes: totalMinutes
    })
  }
  
  return trend
}

// OPTIONS リクエスト対応（CORS）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
