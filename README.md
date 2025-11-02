# Mastra + Next.js チャットアプリ

このプロジェクトは、[Mastra](https://mastra.ai)と[Next.js](https://nextjs.org)を統合したAIチャットアプリケーションのテスト実装です。

## 機能

- Next.js App Routerを使用
- MastraによるAIエージェント統合
- Vercel AI SDK UIによるストリーミングチャット
- Anthropic Claude 3.5 Haikuモデルを使用

## プロジェクト構造

```
mastra-test/
├── app/
│   ├── actions/
│   │   └── chat.ts                # チャットServer Action
│   └── page.tsx                   # チャットUIページ
├── mastra/
│   ├── agents/
│   │   └── assistant-agent.ts    # Mastraエージェント定義
│   └── index.ts                   # Mastraインスタンス
├── docs/
│   └── mastra-nextjs.md          # Mastraの完全ガイド
├── .env.local                     # 環境変数
├── next.config.ts                 # Next.js設定
└── package.json
```

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルにAnthropic Claude APIキーを設定してください：

```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
```

APIキーは以下から取得できます：

- Anthropic: https://console.anthropic.com/

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

1. チャット画面が表示されます
2. メッセージを入力して送信
3. AIがリアルタイムでストリーミング応答します

## 主な技術スタック

- **Next.js 15**: React フレームワーク
- **Mastra**: AIエージェントフレームワーク
- **Vercel AI SDK**: ストリーミングチャットUI
- **Anthropic Claude 3.5 Haiku**: 言語モデル
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: スタイリング

## Mastraについて

Mastraは、TypeScript製のAIエージェントフレームワークです。詳細については `docs/mastra-nextjs.md` をご覧ください。

### 主な特徴

- TypeScriptネイティブで型安全
- エージェント、ワークフロー、RAG、メモリを統合
- 40以上のLLMプロバイダーに対応
- Next.js/React完全統合

## 次のステップ

- `mastra/agents/assistant-agent.ts` でエージェントの指示を変更
- カスタムツールの追加
- メモリ機能の追加（会話履歴の保持）
- RAGの実装（ドキュメント検索）

## リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Mastra ドキュメント](https://mastra.ai/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

## デプロイ

Vercelへのデプロイが最も簡単です：

1. GitHubにプッシュ
2. [Vercel](https://vercel.com)でインポート
3. 環境変数 `ANTHROPIC_API_KEY` を設定
4. デプロイ

詳細は `docs/mastra-nextjs.md` のデプロイセクションを参照してください。
