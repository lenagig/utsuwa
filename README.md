# 器 / UTSUWA

人物や行動の説明から、Geminiが図鑑の器をひとつ選ぶアプリです。メールアドレス・パスワードでログインすると、図鑑の解放状態と全国の本日生まれた器数を保存します。

## 初回セットアップ

```powershell
npm install
Copy-Item .env.example .env.local
```

`.env.local` に Gemini と Supabase の値を設定します。`.env.local` はGitへ追加されません。

### Supabase

1. [Supabase](https://supabase.com/) でプロジェクトを作成します。
2. SQL Editorで [`supabase/schema.sql`](./supabase/schema.sql) の内容を実行します。
3. Project Settings → API から URL、anon key、service_role key を `.env.local` に設定します。
4. Authentication → Providers → Email を有効にします。開発中は「Confirm email」を無効にすると、登録直後にログインできます。

`SUPABASE_SERVICE_ROLE_KEY` はサーバー側専用です。ブラウザ側のコード・Git・スクリーンショットに出さないでください。

## 起動

```powershell
npm run dev
```

`http://localhost:3000` を開きます。

## 確認

```powershell
npm run lint
npm run typecheck
```
