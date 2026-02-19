---
description: itch.io へゲームをデプロイする
---

# itch.io デプロイ手順

対象: https://mirenn00.itch.io/prisonermanagement
Butler場所: `%USERPROFILE%\butler\butler.exe`
チャンネル: html5

## 初回のみ: Butler ログイン

// turbo
1. 以下のコマンドを実行してitch.ioにログインする（ブラウザが開いて認証）
```
& "$env:USERPROFILE\butler\butler.exe" login
```

## デプロイ手順

// turbo
2. デプロイスクリプトを実行する（ビルド→アップロードを自動実行）
```
.\deploy.ps1
```

これで `npm run build` と `butler push` が自動で実行され、itch.io にアップロードされる。

## 注意事項
- 初回のみ `butler login` でブラウザ認証が必要
- 一度ログインすれば認証情報は保存され、次回以降は不要
- `dist/` フォルダが最新のビルドであることを確認すること
