# セットアップガイド

## APIキーの設定方法

このアプリを動作させるには、LLM（大規模言語モデル）のAPIキーが**必須**です。

## オプション1: OpenAI（推奨）

### 料金

- 従量課金制
- GPT-4o-mini: $0.15/1M入力トークン、$0.60/1M出力トークン
- 初回$5のクレジット付き

### 取得方法

1. https://platform.openai.com/ にアクセス
2. アカウント作成/ログイン
3. 右上のメニューから「API Keys」を選択
4. 「Create new secret key」をクリック
5. キーをコピー

### 設定方法

`.env.local` ファイルを編集：

```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

---

## オプション2: Google Gemini（無料枠あり）

### 料金

- Gemini 1.5 Flash: 無料枠あり（1分あたり15リクエストまで）
- Gemini 1.5 Pro: 無料枠あり（1分あたり2リクエストまで）

### 取得方法

1. https://aistudio.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. 「Create API key」をクリック
4. キーをコピー

### 設定方法

1. パッケージをインストール：

```bash
pnpm install @ai-sdk/google
```

2. `mastra/agents/assistant-agent.ts` を編集：

```typescript
import { Agent } from '@mastra/core/agent';
import { google } from '@ai-sdk/google';

export const assistantAgent = new Agent({
  name: 'assistant',
  instructions: 'あなたは親切なAIアシスタントです。日本語で丁寧に回答してください。',
  model: google('gemini-1.5-flash'), // または gemini-1.5-pro
});
```

3. `.env.local` ファイルを編集：

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
```

---

## オプション3: Anthropic Claude

### 料金

- Claude 3.5 Haiku: $0.80/1M入力トークン、$4.00/1M出力トークン
- 初回$5のクレジット付き

### 取得方法

1. https://console.anthropic.com/ にアクセス
2. アカウント作成
3. API Keysセクションでキー作成

### 設定方法

1. パッケージをインストール：

```bash
pnpm install @ai-sdk/anthropic
```

2. `mastra/agents/assistant-agent.ts` を編集：

```typescript
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const assistantAgent = new Agent({
  name: 'assistant',
  instructions: 'あなたは親切なAIアシスタントです。日本語で丁寧に回答してください。',
  model: anthropic('claude-3-5-haiku-20241022'),
});
```

3. `.env.local` ファイルを編集：

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

---

## 設定後の確認

1. APIキーを設定したら、開発サーバーを起動：

```bash
pnpm dev
```

2. ブラウザで http://localhost:3000 を開く

3. チャットで「こんにちは」と送信して動作確認

## トラブルシューティング

### エラー: "API key not found"

- `.env.local` ファイルが正しい場所にあるか確認
- 開発サーバーを再起動（Ctrl+Cで停止 → `pnpm dev` で再起動）

### エラー: "Invalid API key"

- APIキーが正しくコピーされているか確認
- 余分なスペースや改行が入っていないか確認

### エラー: "Rate limit exceeded"

- APIの使用制限に達している可能性
- 無料枠の場合は時間をおいて再試行
- 有料プランへのアップグレードを検討

---

## おすすめの選択

- **学習・テスト目的**: Google Gemini（無料枠）
- **本番環境**: OpenAI GPT-4o-mini（コスパ最高）
- **高品質な応答**: Anthropic Claude 3.5 Haiku

どのプロバイダーを選んでも、Mastraのコード変更は最小限で済みます。
