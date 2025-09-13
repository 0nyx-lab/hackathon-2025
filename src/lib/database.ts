import { supabaseAdmin } from './supabase'
import { User, Activity, GrowthMetric, BadgeEarned, Category } from '@/types'

// 簡略化されたデータベース操作（フォールバック対応）

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}

export async function getRecentActivities(userId: string, days: number): Promise<Activity[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getRecentActivities error:', error)
    return []
  }
}

export async function getGrowthMetrics(userId: string, days: number): Promise<GrowthMetric[]> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabaseAdmin
      .from('growth_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getGrowthMetrics error:', error)
    return []
  }
}

export async function getBadges(userId: string): Promise<BadgeEarned[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getBadges error:', error)
    return []
  }
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('activities')
      .insert([activity])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('createActivity error:', error)
    return null
  }
}

export async function createBadge(badge: Omit<BadgeEarned, 'id'>): Promise<BadgeEarned | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('badges')
      .insert([badge])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('createBadge error:', error)
    return null
  }
}

export async function updateGrowthMetrics(metrics: Omit<GrowthMetric, 'updated_at'>): Promise<GrowthMetric | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('growth_metrics')
      .upsert([metrics])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('updateGrowthMetrics error:', error)
    return null
  }
}