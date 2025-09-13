-- Steppy データベーススキーマ
-- Supabase PostgreSQL用

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(50),
  category_preferences JSONB DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- カテゴリマスタテーブル
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon_name VARCHAR(30),
  color_code VARCHAR(7),
  description TEXT
);

-- カテゴリ初期データ
INSERT INTO categories (id, name, icon_name, color_code, description) VALUES 
('learning', '学習', 'book', '#3B82F6', '語学・資格・読書など'),
('work', '仕事', 'briefcase', '#10B981', 'スキルアップ・効率化など'),
('life', '生活', 'home', '#F59E0B', '家事・整理・生活改善など'),
('health', '健康', 'heart', '#EF4444', '運動・食事・メンタルケアなど')
ON CONFLICT (id) DO NOTHING;

-- アクティビティテーブル
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(20) NOT NULL REFERENCES categories(id),
  task_title VARCHAR(100) NOT NULL,
  task_description TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  result_data JSONB DEFAULT '{}',
  source VARCHAR(20) DEFAULT 'app' CHECK (source IN ('app', 'import')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, DATE(completed_at));
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category_id);
CREATE INDEX IF NOT EXISTS idx_activities_completed_at ON activities(completed_at);

-- 成長指標テーブル
CREATE TABLE IF NOT EXISTS growth_metrics (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category_id VARCHAR(20) NOT NULL REFERENCES categories(id),
  total_minutes INTEGER DEFAULT 0,
  activity_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  balance_score DECIMAL(3,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, date, category_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_growth_metrics_user_date ON growth_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON growth_metrics(date);

-- バッジテーブル
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(30) NOT NULL CHECK (badge_type IN ('continuity', 'challenge', 'balance')),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  category_id VARCHAR(20) REFERENCES categories(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ユニークインデックス（同じバッジの重複防止）
CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_unique ON badges(user_id, badge_type, level, COALESCE(category_id, ''));

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_earned_at ON badges(earned_at);

-- デモユーザーデータ
INSERT INTO users (id, nickname, category_preferences, timezone) VALUES 
('demo_user_001', 'デモユーザー', '{"learning": 1.0, "work": 0.8, "life": 0.6, "health": 0.7}', 'Asia/Tokyo')
ON CONFLICT (id) DO NOTHING;

-- サンプルアクティビティデータ
INSERT INTO activities (user_id, category_id, task_title, task_description, completed_at, duration_seconds, result_data) VALUES 
('demo_user_001', 'learning', '英単語1個覚える', 'Innovation = 革新', NOW() - INTERVAL '1 day', 45, '{"completed": true, "confidence": "high"}'),
('demo_user_001', 'health', '朝のストレッチ', '首回し、肩回し、背伸び', NOW() - INTERVAL '1 day', 60, '{"completed": true, "confidence": "medium"}'),
('demo_user_001', 'work', '効率化アイデア', '作業改善案の検討', NOW() - INTERVAL '2 days', 55, '{"completed": true, "confidence": "high"}'),
('demo_user_001', 'learning', 'プログラミング概念', 'Closureの理解', NOW() - INTERVAL '2 days', 50, '{"completed": true, "confidence": "medium"}'),
('demo_user_001', 'life', '整理整頓', 'デスク周りの整理', NOW() - INTERVAL '3 days', 40, '{"completed": true, "confidence": "high"}')
ON CONFLICT DO NOTHING;

-- サンプル成長指標データ
INSERT INTO growth_metrics (user_id, date, category_id, total_minutes, activity_count, streak_days, balance_score) VALUES 
('demo_user_001', CURRENT_DATE - INTERVAL '1 day', 'learning', 1, 1, 5, 1.2),
('demo_user_001', CURRENT_DATE - INTERVAL '1 day', 'health', 1, 1, 5, 1.2),
('demo_user_001', CURRENT_DATE - INTERVAL '2 days', 'work', 1, 1, 4, 1.1),
('demo_user_001', CURRENT_DATE - INTERVAL '2 days', 'learning', 1, 1, 4, 1.1),
('demo_user_001', CURRENT_DATE - INTERVAL '3 days', 'life', 1, 1, 3, 1.0)
ON CONFLICT (user_id, date, category_id) DO NOTHING;

-- サンプルバッジデータ
INSERT INTO badges (user_id, badge_type, level, earned_at, metadata) VALUES 
('demo_user_001', 'continuity', 1, NOW() - INTERVAL '3 days', '{"consecutive_days": 3}'),
('demo_user_001', 'continuity', 2, NOW() - INTERVAL '1 day', '{"consecutive_days": 5}'),
('demo_user_001', 'challenge', 1, NOW() - INTERVAL '2 days', '{"active_categories": 2}'),
('demo_user_001', 'balance', 1, NOW() - INTERVAL '1 day', '{"balance_score": 1.2, "active_categories": 3}')
ON CONFLICT (user_id, badge_type, level, COALESCE(category_id, '')) DO NOTHING;

-- Row Level Security (RLS) 設定
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（認証済みユーザーのみアクセス可能）
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own growth_metrics" ON growth_metrics FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own growth_metrics" ON growth_metrics FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- カテゴリは全ユーザーが閲覧可能
CREATE POLICY "Categories are viewable by all" ON categories FOR SELECT USING (true);

-- 関数：成長指標の自動更新
CREATE OR REPLACE FUNCTION update_growth_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- アクティビティ作成時に成長指標を更新
  INSERT INTO growth_metrics (
    user_id, 
    date, 
    category_id, 
    total_minutes, 
    activity_count, 
    streak_days, 
    balance_score
  ) VALUES (
    NEW.user_id,
    DATE(NEW.completed_at),
    NEW.category_id,
    CEIL((NEW.duration_seconds::DECIMAL) / 60),
    1,
    0, -- 後で計算
    0.0 -- 後で計算
  )
  ON CONFLICT (user_id, date, category_id) 
  DO UPDATE SET
    total_minutes = growth_metrics.total_minutes + CEIL((NEW.duration_seconds::DECIMAL) / 60),
    activity_count = growth_metrics.activity_count + 1,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER trigger_update_growth_metrics
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_growth_metrics();

-- ビュー：ユーザー統計
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.nickname,
  COUNT(DISTINCT a.id) as total_activities,
  COUNT(DISTINCT a.category_id) as active_categories,
  COALESCE(SUM(gm.total_minutes), 0) as total_minutes,
  COUNT(DISTINCT b.id) as total_badges,
  MAX(a.completed_at) as last_activity
FROM users u
LEFT JOIN activities a ON u.id = a.user_id
LEFT JOIN growth_metrics gm ON u.id = gm.user_id
LEFT JOIN badges b ON u.id = b.user_id
GROUP BY u.id, u.nickname;

-- ビュー：カテゴリ別統計
CREATE OR REPLACE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.icon_name,
  c.color_code,
  COUNT(DISTINCT a.user_id) as active_users,
  COUNT(a.id) as total_activities,
  AVG(a.duration_seconds) as avg_duration,
  COUNT(DISTINCT b.user_id) as badge_earners
FROM categories c
LEFT JOIN activities a ON c.id = a.category_id
LEFT JOIN badges b ON c.id = b.category_id
GROUP BY c.id, c.name, c.icon_name, c.color_code;
