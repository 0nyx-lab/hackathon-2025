import { Activity, BadgeEarned, GrowthMetric } from '@/types'
import { createBadge, getBadges } from './database'

// バッジ定義
export const BADGE_DEFINITIONS = {
  continuity: [
    { level: 1, name: '継続力★1', condition: '3日連続完了', days: 3 },
    { level: 2, name: '継続力★2', condition: '7日連続完了', days: 7 },
    { level: 3, name: '継続力★3', condition: '14日連続完了', days: 14 },
    { level: 4, name: '継続力★4', condition: '30日連続完了', days: 30 },
    { level: 5, name: '継続力★5', condition: '100日連続完了', days: 100 }
  ],
  challenge: [
    { level: 1, name: '挑戦性★1', condition: '1週間で2カテゴリ以上実行', categories: 2 },
    { level: 2, name: '挑戦性★2', condition: '1週間で3カテゴリ以上実行', categories: 3 },
    { level: 3, name: '挑戦性★3', condition: '1週間で4カテゴリ実行', categories: 4 },
    { level: 4, name: '挑戦性★4', condition: '1ヶ月で全カテゴリ実行', categories: 4, period: 'month' },
    { level: 5, name: '挑戦性★5', condition: '継続的に全カテゴリ実行', categories: 4, period: 'ongoing' }
  ],
  balance: [
    { level: 1, name: 'バランス力★1', condition: '1週間で3カテゴリ以上実行', categories: 3 },
    { level: 2, name: 'バランス力★2', condition: 'バランススコア0.8以上', score: 0.8 },
    { level: 3, name: 'バランス力★3', condition: 'バランススコア1.2以上', score: 1.2 },
    { level: 4, name: 'バランス力★4', condition: 'バランススコア1.5以上', score: 1.5 },
    { level: 5, name: 'バランス力★5', condition: 'バランススコア2.0以上', score: 2.0 }
  ]
}

// バッジ獲得判定
export async function checkAndAwardBadges(
  userId: string,
  newActivity?: Activity,
  growthMetrics?: GrowthMetric[]
): Promise<string[]> {
  const earnedBadges: string[] = []
  const existingBadges = await getBadges(userId)
  
  // 継続力バッジチェック
  const continuityBadges = await checkContinuityBadges(userId, existingBadges)
  earnedBadges.push(...continuityBadges)
  
  // 挑戦性バッジチェック
  const challengeBadges = await checkChallengeBadges(userId, existingBadges, growthMetrics)
  earnedBadges.push(...challengeBadges)
  
  // バランス力バッジチェック
  const balanceBadges = await checkBalanceBadges(userId, existingBadges, growthMetrics)
  earnedBadges.push(...balanceBadges)
  
  return earnedBadges
}

// 継続力バッジ判定
async function checkContinuityBadges(
  userId: string,
  existingBadges: BadgeEarned[]
): Promise<string[]> {
  const earnedBadges: string[] = []
  
  // 連続日数計算（簡易版）
  const consecutiveDays = await calculateConsecutiveDays(userId)
  
  for (const badge of BADGE_DEFINITIONS.continuity) {
    const alreadyEarned = existingBadges.some(
      b => b.badge_type === 'continuity' && b.level === badge.level
    )
    
    if (!alreadyEarned && consecutiveDays >= badge.days) {
      await createBadge({
        user_id: userId,
        badge_type: 'continuity',
        level: badge.level,
        earned_at: new Date().toISOString(),
        metadata: { consecutive_days: consecutiveDays }
      })
      earnedBadges.push(badge.name)
    }
  }
  
  return earnedBadges
}

// 挑戦性バッジ判定
async function checkChallengeBadges(
  userId: string,
  existingBadges: BadgeEarned[],
  growthMetrics?: GrowthMetric[]
): Promise<string[]> {
  const earnedBadges: string[] = []
  
  if (!growthMetrics) return earnedBadges
  
  // 過去1週間のカテゴリ数計算
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const recentMetrics = growthMetrics.filter(
    m => new Date(m.date) >= weekAgo && m.activity_count > 0
  )
  
  const activeCategories = new Set(recentMetrics.map(m => m.category_id)).size
  
  for (const badge of BADGE_DEFINITIONS.challenge) {
    const alreadyEarned = existingBadges.some(
      b => b.badge_type === 'challenge' && b.level === badge.level
    )
    
    if (!alreadyEarned && activeCategories >= badge.categories) {
      await createBadge({
        user_id: userId,
        badge_type: 'challenge',
        level: badge.level,
        earned_at: new Date().toISOString(),
        metadata: { active_categories: activeCategories }
      })
      earnedBadges.push(badge.name)
    }
  }
  
  return earnedBadges
}

// バランス力バッジ判定
async function checkBalanceBadges(
  userId: string,
  existingBadges: BadgeEarned[],
  growthMetrics?: GrowthMetric[]
): Promise<string[]> {
  const earnedBadges: string[] = []
  
  if (!growthMetrics) return earnedBadges
  
  // バランススコア計算（Shannon多様性指数応用）
  const balanceScore = calculateBalanceScore(growthMetrics)
  
  // 過去1週間のカテゴリ数計算
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const recentMetrics = growthMetrics.filter(
    m => new Date(m.date) >= weekAgo && m.activity_count > 0
  )
  
  const activeCategories = new Set(recentMetrics.map(m => m.category_id)).size
  
  for (const badge of BADGE_DEFINITIONS.balance) {
    const alreadyEarned = existingBadges.some(
      b => b.badge_type === 'balance' && b.level === badge.level
    )
    
    if (alreadyEarned) continue
    
    let shouldAward = false
    
    if (badge.categories && activeCategories >= badge.categories) {
      shouldAward = true
    } else if (badge.score && balanceScore >= badge.score) {
      shouldAward = true
    }
    
    if (shouldAward) {
      await createBadge({
        user_id: userId,
        badge_type: 'balance',
        level: badge.level,
        earned_at: new Date().toISOString(),
        metadata: { 
          balance_score: balanceScore,
          active_categories: activeCategories 
        }
      })
      earnedBadges.push(badge.name)
    }
  }
  
  return earnedBadges
}

// 連続日数計算（簡易版）
async function calculateConsecutiveDays(userId: string): Promise<number> {
  // 実際の実装では、データベースから過去のアクティビティを取得して計算
  // ここでは簡易版として、ランダムな値を返す
  return Math.floor(Math.random() * 10) + 1
}

// バランススコア計算
function calculateBalanceScore(growthMetrics: GrowthMetric[]): number {
  const categoryCounts = new Map<string, number>()
  
  // カテゴリ別の活動回数を集計
  for (const metric of growthMetrics) {
    const current = categoryCounts.get(metric.category_id) || 0
    categoryCounts.set(metric.category_id, current + metric.activity_count)
  }
  
  const total = Array.from(categoryCounts.values()).reduce((sum, count) => sum + count, 0)
  
  if (total === 0) return 0
  
  // Shannon多様性指数計算
  let diversity = 0
  for (const count of categoryCounts.values()) {
    const ratio = count / total
    if (ratio > 0) {
      diversity -= ratio * Math.log2(ratio)
    }
  }
  
  return diversity
}
