#!/bin/bash

# 🎯 審査員向けクイックデプロイスクリプト

echo "🚀 Steppy 審査員向けデプロイ開始..."

# 1. 静的ビルド実行
echo "📦 静的ビルド実行中..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 静的ビルド成功"
else
    echo "❌ 静的ビルド失敗"
    exit 1
fi

# 2. ローカルサーバー起動（バックグラウンド）
echo "🌐 ローカルサーバー起動中..."
npx serve out -p 8080 &
LOCAL_PID=$!

# 3. Netlify Drop用フォルダ準備
echo "📁 Netlify Drop用フォルダ準備中..."
cp -r out netlify-drop-folder

# 4. 審査員向け情報表示
echo ""
echo "🎯 審査員向けアクセス情報"
echo "================================"
echo "📱 ローカルアクセス:"
echo "   http://localhost:8080"
echo ""
echo "🌐 リモートアクセス:"
echo "   1. Netlify Drop: https://app.netlify.com/drop"
echo "   2. netlify-drop-folder をドラッグ&ドロップ"
echo ""
echo "📋 デモ手順:"
echo "   1. タスクカードを確認"
echo "   2. 「✓ 完了する」をクリック"
echo "   3. 完了アニメーション確認"
echo "   4. 新しいタスクの自動取得確認"
echo ""
echo "🔧 トラブルシューティング:"
echo "   - ローカルサーバー停止: kill $LOCAL_PID"
echo "   - 再起動: ./deploy-for-judges.sh"
echo ""
echo "✅ デプロイ準備完了！"
echo "================================"
