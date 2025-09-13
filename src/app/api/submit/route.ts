import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { taskId, startTime, endTime } = await request.json()
    
    // 完了時間の計算
    const duration = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : 60
    
    // ポイント計算（1分 = 10ポイント）
    const points = Math.max(10, Math.min(duration * 10, 100))
    
    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: 'タスクが完了しました！',
      points: points,
      duration: duration,
      completedAt: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to submit task' },
      { status: 500 }
    )
  }
}