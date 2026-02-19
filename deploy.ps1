#!/usr/bin/env pwsh
# itch.io 自動デプロイスクリプト
# 使い方: .\deploy.ps1

$ErrorActionPreference = "Stop"

$BUTLER = "$env:USERPROFILE\butler\butler.exe"
$ITCH_USER = "mirenn00"
$ITCH_GAME = "prisonermanagement"
$ITCH_CHANNEL = "html5"
$DIST_DIR = ".\dist"

Write-Host "=== 囚人管理シミュレーター デプロイ ===" -ForegroundColor Cyan

# 1. ビルド
Write-Host "`n[1/2] ビルド中..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ビルド失敗！" -ForegroundColor Red
    exit 1
}
Write-Host "ビルド完了" -ForegroundColor Green

# 2. Butler でアップロード
Write-Host "`n[2/2] itch.io へアップロード中..." -ForegroundColor Yellow
& $BUTLER push $DIST_DIR "${ITCH_USER}/${ITCH_GAME}:${ITCH_CHANNEL}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "アップロード失敗！" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== デプロイ完了！ ===" -ForegroundColor Green
Write-Host "https://${ITCH_USER}.itch.io/${ITCH_GAME}" -ForegroundColor Cyan
