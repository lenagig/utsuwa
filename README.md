# UTSUWA

身近なイライラを「器」に変えるAIプロダクトのフロントエンドです。

## 必要なもの

- Node.js
- npm

動作確認済みの環境:

```bash
node --version
npm --version
```

このプロジェクト作成時点では、Node.js `v22.18.0` / npm `10.9.3` で動作確認しています。

## 初回セットアップ

リポジトリを取得したあと、プロジェクト直下で依存関係をインストールします。

```bash
npm install
```

## 開発サーバーの起動

```bash
npm run dev
```

起動できたら、ブラウザで以下を開きます。

```text
http://localhost:3000
```

## よく使うコマンド

```bash
npm run dev
```

開発サーバーを起動します。

```bash
npm run lint
```

ESLintでコードをチェックします。

```bash
npm run typecheck
```

TypeScriptの型チェックを実行します。

```bash
npm run build
```

本番ビルドが通るか確認します。

```bash
npm run start
```

`npm run build` 後に、本番ビルドをローカルで起動します。

## 技術構成

- Next.js
- TypeScript
- React
- CSS

## 画像素材

タイトル画面の背景画像は以下に配置しています。

```text
public/images/utsuwa_back.png
```

Next.js上では次のパスで参照できます。

```text
/images/utsuwa_back.png
```
