import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // データベース接続確認
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('count')
      .limit(1)
    
    const dbStatus = error ? 'error' : 'ok'
    const responseTime = Date.now() - startTime
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'ok'
      },
      responseTime,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json(healthData)
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'error',
        api: 'error'
      },
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json(healthData, { status: 503 })
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
