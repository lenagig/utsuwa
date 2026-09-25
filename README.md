# 器（UTSUWA）

人や行動の内容を入力すると、Geminiが図鑑内の器からひとつを選ぶアプリです。器は生成された時点で図鑑に解放されます。

## 必要なもの

- Node.js 22以降
- Gemini APIキー（任意。未設定時はローカルの簡易選択で動作します）

## 起動

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## Gemini APIキーの設定

`.env.local` を開き、次の値だけを書き換えます。

```env
GEMINI_API_KEY=ここにGoogle_AI_StudioのAPIキー
```

必要に応じて `GEMINI_MODEL` も変更できます。APIキーはNext.jsのサーバー側APIルートでのみ読み込み、ブラウザやGitには含まれません。

`.env.local` は `.gitignore` によりコミット対象外です。`.env.example` だけをGitへ含めてください。
