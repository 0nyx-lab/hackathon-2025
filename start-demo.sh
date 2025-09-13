#!/bin/bash

# 🚀 Steppy Demo Server (macOS/Linux版)

echo ""
echo "🚀 Steppy Demo Server Starting..."
echo "====================================="

# 現在のディレクトリ確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.json が見つかりません"
    echo "   hackathon-2025 ディレクトリで実行してください"
    exit 1
fi

# 依存関係確認
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストール中..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依存関係のインストールに失敗しました"
        exit 1
    fi
fi

# 静的ビルド実行
echo "🔨 静的ビルド実行中..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi

# 静的サーバー起動
echo "🌐 ローカルサーバー起動中..."
echo ""
echo "✅ Steppy Demo Server が起動しました！"
echo "📱 アクセスURL: http://localhost:8080"
echo ""
echo "🎯 デモ手順:"
echo "   1. ブラウザで http://localhost:8080 にアクセス"
echo "   2. タスクカードを確認"
echo "   3. 「✓ 完了する」ボタンをクリック"
echo "   4. 完了アニメーションを確認"
echo ""
echo "🌐 審査員への共有方法:"
echo "   - スクリーンシェアでブラウザ画面を共有"
echo "   - リモートデスクトップで審査員が直接操作"
echo "   - 画面録画でデモ動画を作成"
echo ""
echo "⏹️  サーバー停止: Ctrl+C"
echo "====================================="
echo ""

# サーバー起動
npx serve out -p 8080
