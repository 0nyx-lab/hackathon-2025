import { NextRequest, NextResponse } from 'next/server'
import { getUser, getRecentActivities } from '@/lib/database'
import { generateTaskRecommendations, getTimeOfDay, getFallbackTasks } from '@/lib/openai'
import { getMockTodayResponse } from '@/lib/mock-data'
import { TodayResponse, ApiError } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('user_id') || 'demo_user_001'
    
    // 第1段階：通常動作
    try {
      // ユーザー情報取得
      let user = await getUser(userId)
      
      if (!user) {
        // デモユーザー作成
        user = {
          id: userId,
          nickname: 'デモユーザー',
          category_preferences: {
            learning: 1.0,
            work: 0.8,
            life: 0.6,
            health: 0.7
          },
          timezone: 'Asia/Tokyo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      
      // 最近のアクティビティ取得
      const recentActivities = await getRecentActivities(userId, 7)
      
      // AI推薦タスク生成
      const timeOfDay = getTimeOfDay()
      const recommendedTasks = await generateTaskRecommendations(
        user,
        recentActivities,
        timeOfDay
      )
      
      if (recommendedTasks.length > 0) {
        const response: TodayResponse = {
          user_id: userId,
          cards: recommendedTasks,
          recommendations: {
            primary: timeOfDay === 'morning' ? '学習' : timeOfDay === 'afternoon' ? '仕事' : '健康',
            balance_suggestion: recentActivities.length > 0 ? 
              '今日も継続して素晴らしいです！' : 
              '今日から始めてみましょう！'
          }
        }
        
        return NextResponse.json(response)
      }
      
      throw new Error('AI recommendation failed')
      
    } catch (error) {
      console.warn('Primary API failed, falling back to template:', error)
      
      // 第2段階：定型タスク推薦
      try {
        const timeOfDay = getTimeOfDay()
        const fallbackTasks = getFallbackTasks(timeOfDay)
        
        const response: TodayResponse = {
          user_id: userId,
          cards: fallbackTasks,
          recommendations: {
            primary: timeOfDay === 'morning' ? '学習' : timeOfDay === 'afternoon' ? '仕事' : '健康',
            balance_suggestion: '今日も頑張りましょう！'
          }
        }
        
        return NextResponse.json(response)
        
      } catch (fallbackError) {
        console.warn('Fallback failed, using mock data:', fallbackError)
        
        // 第3段階：モックデータ
        const mockResponse = getMockTodayResponse()
        mockResponse.user_id = userId
        
        return NextResponse.json(mockResponse)
      }
    }
    
  } catch (error) {
    console.error('API Error:', error)
    
    const errorResponse: ApiError = {
      error: 'Internal Server Error',
      message: '今日のタスク取得に失敗しました',
      status: 500
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
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
