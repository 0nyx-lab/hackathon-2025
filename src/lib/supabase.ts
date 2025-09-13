import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// クライアント用（ブラウザ）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバー用（管理権限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// データベース型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nickname: string | null
          category_preferences: Record<string, any> | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nickname?: string | null
          category_preferences?: Record<string, any> | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string | null
          category_preferences?: Record<string, any> | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          icon_name: string | null
          color_code: string | null
          description: string | null
        }
        Insert: {
          id: string
          name: string
          icon_name?: string | null
          color_code?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          icon_name?: string | null
          color_code?: string | null
          description?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          category_id: string
          task_title: string
          task_description: string | null
          started_at: string | null
          completed_at: string
          duration_seconds: number | null
          result_data: Record<string, any> | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          task_title: string
          task_description?: string | null
          started_at?: string | null
          completed_at: string
          duration_seconds?: number | null
          result_data?: Record<string, any> | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          task_title?: string
          task_description?: string | null
          started_at?: string | null
          completed_at?: string
          duration_seconds?: number | null
          result_data?: Record<string, any> | null
          source?: string
          created_at?: string
        }
      }
      growth_metrics: {
        Row: {
          user_id: string
          date: string
          category_id: string
          total_minutes: number
          activity_count: number
          streak_days: number
          balance_score: number
          updated_at: string
        }
        Insert: {
          user_id: string
          date: string
          category_id: string
          total_minutes?: number
          activity_count?: number
          streak_days?: number
          balance_score?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          date?: string
          category_id?: string
          total_minutes?: number
          activity_count?: number
          streak_days?: number
          balance_score?: number
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          level: number
          category_id: string | null
          earned_at: string
          metadata: Record<string, any> | null
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          level: number
          category_id?: string | null
          earned_at?: string
          metadata?: Record<string, any> | null
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          level?: number
          category_id?: string | null
          earned_at?: string
          metadata?: Record<string, any> | null
        }
      }
    }
  }
}
