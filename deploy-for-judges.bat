@echo off
chcp 65001 >nul

REM 🎯 審査員向けクイックデプロイスクリプト（Windows版）

echo 🚀 Steppy 審査員向けデプロイ開始...

REM 1. 静的ビルド実行
echo 📦 静的ビルド実行中...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ 静的ビルド成功
) else (
    echo ❌ 静的ビルド失敗
    pause
    exit /b 1
)

REM 2. ローカルサーバー起動（バックグラウンド）
echo 🌐 ローカルサーバー起動中...
start /b npx serve out -p 8080

REM 3. Netlify Drop用フォルダ準備
echo 📁 Netlify Drop用フォルダ準備中...
xcopy /E /I out netlify-drop-folder

REM 4. 審査員向け情報表示
echo.
echo 🎯 審査員向けアクセス情報
echo ================================
echo 📱 ローカルアクセス:
echo    http://localhost:8080
echo.
echo 🌐 リモートアクセス:
echo    1. Netlify Drop: https://app.netlify.com/drop
echo    2. netlify-drop-folder をドラッグ^&ドロップ
echo.
echo 📋 デモ手順:
echo    1. タスクカードを確認
echo    2. 「✓ 完了する」をクリック
echo    3. 完了アニメーション確認
echo    4. 新しいタスクの自動取得確認
echo.
echo 🔧 トラブルシューティング:
echo    - ローカルサーバー停止: Ctrl+C
echo    - 再起動: deploy-for-judges.bat
echo.
echo ✅ デプロイ準備完了！
echo ================================
pause
