# Steppy開発：詰まりやすい"穴"の厳密対策

## 1. デモ安定性の穴：完全対策

### 三段フォールバック実装詳細

**レベル1：正常動作**

```javascript
// API呼び出し関数
const fetchTodaySteps = async (userId) => {
  try {
    const response = await fetch('/api/today', {
      timeout: 2000, // 2秒でタイムアウト
      headers: { 'User-ID': userId }
    });
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.warn('Level 1 failed, falling back to cache');
    return await fallbackLevel2(userId);
  }
};
```

**レベル2：キャッシュ返却**

```javascript
const fallbackLevel2 = async (userId) => {
  try {
    const cached = localStorage.getItem(`steppy_cache_${userId}`);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) { // 24時間以内
        return { ...data.content, source: 'cache' };
      }
    }
    throw new Error('Cache expired');
  } catch (error) {
    console.warn('Level 2 failed, using demo data');
    return fallbackLevel3();
  }
};
```

**レベル3：デモ用固定データ**

```javascript
const fallbackLevel3 = () => {
  return {
    source: 'demo',
    steps: [
      {
        id: 'demo_001',
        category: '学習',
        title: '英単語1個覚える',
        description: 'Innovation = 革新',
        estimatedSeconds: 60
      },
      {
        id: 'demo_002', 
        category: '健康',
        title: '深呼吸3回',
        description: '4秒吸って、6秒で吐く',
        estimatedSeconds: 60
      }
    ]
  };
};
```

### 90秒バックアップ動画準備

**動画作成仕様**

- 解像度：1080p（スマホ画面録画）
- 形式：MP4 + WebM（ブラウザ互換性）
- 音声：日本語ナレーション + BGM
- 字幕：英語対応

**切替実装**

```javascript
// 緊急時動画切替ボタン
const EmergencyVideoButton = () => {
  const switchToVideo = () => {
    const videoContainer = document.getElementById('demo-video');
    const appContainer = document.getElementById('app-root');
    
    appContainer.style.display = 'none';
    videoContainer.style.display = 'block';
    
    const video = videoContainer.querySelector('video');
    video.play();
  };
  
  return (
    <button 
      onClick={switchToVideo}
      className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 text-sm"
    >
      緊急時動画
    </button>
  );
};
```

### モックデータエンドポイント

**静的JSON配信**

```javascript
// /api/mock/today.json (Vercel Static Files)
{
  "user_id": "demo_user",
  "today_steps": [...],
  "streak_days": 7,
  "badges": ["continuity_7", "balance_3"],
  "dashboard": {
    "weekly_minutes": 42,
    "categories_active": 4
  }
}
```

## 2. データ設計の穴：完全対策

### 最小スキーマ確定

**users（最小限）**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(30), -- 必要最小限
  created_at TIMESTAMP DEFAULT NOW()
  -- 収集しない：email, real_name, address, phone
);
```

**step_sessions（核心データ）**

```sql
CREATE TABLE step_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL, -- 学習/仕事/生活/健康
  title VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  duration_seconds INT CHECK (duration_seconds > 0),
  confidence_level VARCHAR(10) DEFAULT 'medium' -- high/medium/low
);
```

**daily_stats（集計専用）**

```sql
CREATE TABLE daily_stats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INT DEFAULT 0,
  total_minutes INT DEFAULT 0,
  categories_touched INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

### 匿名化ポリシー実装

**削除ボタン実装**

```javascript
const DeleteAccountButton = () => {
  const [confirmText, setConfirmText] = useState('');
  
  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    
    try {
      await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'User-ID': currentUserId }
      });
      
      // ローカルデータも削除
      localStorage.clear();
      sessionStorage.clear();
      
      // 完了画面に遷移
      router.push('/deleted');
    } catch (error) {
      console.error('Deletion failed:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <p>全データを削除します。この操作は取り消せません。</p>
      <input 
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE と入力してください"
      />
      <button 
        onClick={handleDelete}
        disabled={confirmText !== 'DELETE'}
        className="bg-red-500 text-white px-4 py-2 disabled:opacity-50"
      >
        完全削除実行
      </button>
    </div>
  );
};
```

### 成果指標一本化

**Steppy指標：連続日数 + バランススコア**

```javascript
const calculateSteppyScore = (userData) => {
  const { streakDays, categoryBalance, totalSteps } = userData;
  
  // ステッピースコア = 連続日数 × バランス係数 × 活動係数
  const balanceMultiplier = Math.min(categoryBalance / 4, 1.0); // 4カテゴリ均等で最大
  const activityMultiplier = Math.log10(totalSteps + 1); // 対数スケール
  
  return Math.round(streakDays * balanceMultiplier * activityMultiplier);
};

// 説明可能な表示
const SteppyScoreDisplay = ({ score, breakdown }) => (
  <div className="bg-blue-50 p-4 rounded">
    <h3>ステッピースコア: {score}</h3>
    <p className="text-sm text-gray-600">
      {breakdown.streakDays}日連続 × バランス{breakdown.balance.toFixed(1)} × 活動量{breakdown.activity.toFixed(1)}
    </p>
  </div>
);
```

## 3. AI利用範囲の穴：完全対策

### AI必然性3点限定

**1. Recommend（推薦）**

```javascript
const getAIRecommendation = async (userHistory) => {
  const prompt = `
ユーザーの過去7日の活動：${JSON.stringify(userHistory)}

上記から、今日取り組むべき1分ステップを1つ推薦してください。
以下の条件を満たすこと：
- 60秒以内で完了可能
- 過去の活動バランスを考慮
- 具体的で実行しやすい

回答形式：
{
  "category": "学習|仕事|生活|健康",
  "title": "20文字以内",
  "description": "具体的な手順30文字以内",
  "reason": "推薦理由30文字以内"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    // フォールバック：定型推薦
    return getTemplateRecommendation(userHistory);
  }
};
```

**2. Summarize（要約）**

```javascript
const generateDailySummary = async (todaySteps) => {
  if (todaySteps.length === 0) return "今日はまだステップがありません";
  
  const prompt = `
今日完了したステップ：
${todaySteps.map(s => `${s.category}: ${s.title}`).join('\n')}

上記を励ましの言葉で要約してください（20文字以内）
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    return `今日は${todaySteps.length}ステップ完了！素晴らしい！`;
  }
};
```

**3. Detect（パターン検出）**

```javascript
const detectStagnation = async (recentHistory) => {
  if (recentHistory.length < 7) return null;
  
  const categories = [...new Set(recentHistory.map(s => s.category))];
  const avgDuration = recentHistory.reduce((sum, s) => sum + s.duration_seconds, 0) / recentHistory.length;
  
  if (categories.length === 1 && avgDuration > 120) {
    return {
      type: 'monotony',
      suggestion: '他のカテゴリにも挑戦してみませんか？',
      actionable: true
    };
  }
  
  return null;
};
```

### 二段モデル設計

**前処理：GPT-4o-mini（安価）**

```javascript
const preprocessUserData = async (rawData) => {
  // カテゴリ分類、基本パターン認識
  // コスト：$0.001/1K tokens
};

const generatePersonalizedContent = async (processedData) => {
  // 個別化されたコンテンツ生成
  // コスト：$0.002/1K tokens
};
```

## 4. UX設計の穴：完全対策

### 30秒1導線固定

**デモシナリオ（厳密版）**

```
0-5秒：ホーム画面表示
  → ステッピーマスコット表示
  → 「今日のステップ」カード3枚表示完了

5-15秒：カード選択→実行
  → 「英単語1個覚える」選択
  → タイマー開始（60秒→スキップ可能）
  → 完了ボタン押下

15-25秒：即時成果表示
  → 「今日の一歩！」バッジアニメーション
  → ステッピースコア +1
  → 連続日数更新表示

25-30秒：ダッシュボードプレビュー
  → 週間グラフ更新
  → 「バランス良好！」メッセージ
  → 次のステップ提案表示
```

### 初回5タップ保証

**タップ数検証**

```javascript
const trackTaps = () => {
  let tapCount = 0;
  const targetPath = [
    'home-load',      // 0: 自動
    'card-select',    // 1: タップ
    'start-step',     // 2: タップ  
    'complete-step',  // 3: タップ
    'view-badge',     // 4: タップ
    'dashboard-view'  // 5: タップ or 自動遷移
  ];
  
  const logTap = (action) => {
    if (targetPath.includes(action)) {
      tapCount++;
      console.log(`タップ数: ${tapCount}, アクション: ${action}`);
      
      if (tapCount <= 5 && action === 'dashboard-view') {
        console.log('✅ 5タップ以内で完了');
      }
    }
  };
  
  return logTap;
};
```

### サンプルデータ準備

**空状態でも映えるデータ**

```javascript
const getSampleData = () => ({
  user: {
    nickname: "ステッピー初心者",
    joinedDate: "2025-09-11"
  },
  sampleSteps: [
    {
      category: "学習",
      title: "英単語1個覚える", 
      completed: true,
      duration: 45
    },
    {
      category: "健康",
      title: "深呼吸3回",
      completed: true, 
      duration: 30
    }
  ],
  achievements: [
    { type: "first_step", label: "はじめの一歩", earned: true },
    { type: "streak_3", label: "3日連続", earned: false }
  ],
  steppyScore: 3,
  weeklyProgress: [1, 2, 1, 3, 2, 1, 2] // 過去7日
});
```

## 実装優先度と検証方法

### 最優先（Day 1）

1. 三段フォールバック実装
2. サンプルデータ表示確認
3. 5タップ以内動線テスト

### 優先（Day 2-3）

1. データスキーマ実装
2. 削除ボタン実装
3. AI API統合（最小限）

### 検証方法

```javascript
// 自動テストスイート
const testDemoStability = async () => {
  // API無効化テスト
  await testWithoutAPI();
  
  // ネットワーク断テスト  
  await testOfflineMode();
  
  // 5タップ以内テスト
  await testTapCount();
  
  // 30秒以内テスト
  await testPerformanceTarget();
};
```

この対策により、開発中の典型的な詰まりポイントを事前に回避し、デモ当日の安定性を確保できます。