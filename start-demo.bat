@echo off
chcp 65001 >nul
title Steppy Demo Server

echo.
echo 🚀 Steppy Demo Server Starting...
echo =====================================

REM 現在のディレクトリ確認
if not exist "package.json" (
    echo ❌ エラー: package.json が見つかりません
    echo     hackathon-2025 ディレクトリで実行してください
    pause
    exit /b 1
)

REM 依存関係確認
if not exist "node_modules" (
    echo 📦 依存関係をインストール中...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依存関係のインストールに失敗しました
        pause
        exit /b 1
    )
)

REM 静的ビルド実行
echo 🔨 静的ビルド実行中...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ ビルドに失敗しました
    pause
    exit /b 1
)

REM 静的サーバー起動
echo 🌐 ローカルサーバー起動中...
echo.
echo ✅ Steppy Demo Server が起動しました！
echo 📱 アクセスURL: http://localhost:8080
echo.
echo 🎯 デモ手順:
echo    1. ブラウザで http://localhost:8080 にアクセス
echo    2. タスクカードを確認
echo    3. 「✓ 完了する」ボタンをクリック
echo    4. 完了アニメーションを確認
echo.
echo 🌐 審査員への共有方法:
echo    - スクリーンシェアでブラウザ画面を共有
echo    - リモートデスクトップで審査員が直接操作
echo    - 画面録画でデモ動画を作成
echo.
echo ⏹️  サーバー停止: Ctrl+C
echo =====================================
echo.

REM サーバー起動
npx serve out -p 8080

pause
