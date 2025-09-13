import { NextRequest, NextResponse } from 'next/server'

// CORS設定
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// API レスポンスヘルパー
export function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { 
    status,
    headers: corsHeaders()
  })
}

export function createApiError(message: string, status: number = 500) {
  return NextResponse.json(
    { error: 'API Error', message, status },
    { 
      status,
      headers: corsHeaders()
    }
  )
}

// リクエストバリデーション
export function validateRequiredFields(body: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null) {
      return `Missing required field: ${field}`
    }
  }
  return null
}

// ユーザーID抽出（認証実装時に拡張）
export function extractUserId(request: NextRequest): string {
  // 現在はデモ用の固定値、認証実装時にJWTトークンから抽出
  const userId = request.nextUrl.searchParams.get('user_id') || 
                 request.headers.get('x-user-id') || 
                 'demo_user_001'
  
  return userId
}

// レート制限（簡易版）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, 
  limit: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15分
): boolean {
  const now = Date.now()
  const key = identifier
  
  const current = rateLimitMap.get(key)
  
  if (!current || now > current.resetTime) {
    // 新しいウィンドウを開始
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

// エラーハンドリング
export function handleApiError(error: any, context: string = 'API'): NextResponse {
  console.error(`${context} Error:`, error)
  
  if (error.name === 'ValidationError') {
    return createApiError(error.message, 400)
  }
  
  if (error.name === 'NotFoundError') {
    return createApiError('Resource not found', 404)
  }
  
  if (error.name === 'UnauthorizedError') {
    return createApiError('Unauthorized', 401)
  }
  
  return createApiError('Internal server error', 500)
}

// レスポンス時間測定
export function measureResponseTime(startTime: number): number {
  return Date.now() - startTime
}

// ログ出力
export function logApiCall(
  method: string,
  path: string,
  status: number,
  responseTime: number,
  userId?: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    responseTime,
    userId
  }
  
  console.log('API Call:', JSON.stringify(logEntry))
}

// セキュリティヘッダー
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...corsHeaders()
  }
}
