# Mastra完全ガイド - ローカル環境構築からチャットUI実装まで

## 目次
1. [Mastraとは](#mastraとは)
2. [環境準備](#環境準備)
3. [クイックスタート](#クイックスタート)
4. [Next.js統合（2つの方法）](#nextjs統合)
5. [チャットUIの実装](#チャットuiの実装)
6. [データベース設定](#データベース設定)
7. [デプロイ](#デプロイ)
8. [トラブルシューティング](#トラブルシューティング)

---

## Mastraとは

**Mastra**は、Gatsby.jsを開発したチームによるTypeScript製のAIエージェントフレームワークです。

### 主な特徴
- ✅ TypeScriptネイティブ（型安全）
- ✅ エージェント、ワークフロー、RAG、メモリを統合
- ✅ 40以上のLLMプロバイダーに対応
- ✅ Next.js/React完全統合
- ✅ 1つのDBで完結（PostgreSQL + pgvector または LibSQL）
- ✅ ローカル開発プレイグラウンド付き

### DifyやN8Nとの違い
| 項目 | Dify/N8N | Mastra |
|------|----------|--------|
| 言語 | Python + Node.js | TypeScriptのみ |
| 必須DB | PostgreSQL + Redis | オプション（LibSQLで可） |
| セットアップ | Docker Compose必須 | npm installのみ |
| UI | GUI中心 | コード中心 |
| 対象 | ノーコード/ローコード | プログラマー |

---

## 環境準備

### 必須要件
- Node.js 20以上
- LLM APIキー（OpenAI、Anthropic、Gemini等）

### 推奨要件
- PostgreSQL 14以上（本番環境の場合）
- Git

### APIキーの取得

**OpenAI（推奨）:**
1. https://platform.openai.com/ にアクセス
2. API Keysセクションで新規作成
3. `sk-...` で始まるキーをコピー

**Google Gemini（無料枠あり）:**
1. https://aistudio.google.com/app/apikey にアクセス
2. Create API keyをクリック
3. キーをコピー

---

## クイックスタート

### 1. スタンドアロンプロジェクトの作成

```bash
# 新規プロジェクト作成
npm create mastra@latest my-ai-app

# プロジェクトに移動
cd my-ai-app

# 環境変数設定
echo "OPENAI_API_KEY=sk-your-key-here" > .env.development

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:4111 を開くと、プレイグラウンドが表示されます。

### 2. プレイグラウンドで試す

1. 左側のエージェント一覧から `weatherAgent` を選択
2. 「What's the weather in Tokyo?」と入力
3. エージェントが応答します

### プロジェクト構造

```
my-ai-app/
├── src/
│   └── mastra/
│       ├── index.ts          # Mastra設定
│       ├── agents/           # エージェント定義
│       │   └── weather-agent.ts
│       └── tools/            # カスタムツール
│           └── weather-tool.ts
├── .env.development          # 環境変数
└── package.json
```

---

## Next.js統合

MastraをNext.jsと統合する方法は2つあります。

### アプローチ1: 直接統合（Same Codebase）

**推奨用途:** 小〜中規模プロジェクト、プロトタイプ

#### ステップ1: 既存Next.jsプロジェクトにMastraを追加

```bash
cd your-nextjs-app

# Mastraを初期化
npx mastra@latest init --dir . --components agents,tools --llm openai

# 必要な依存関係をインストール
npm install @mastra/core @mastra/ai-sdk zod
```

#### ステップ2: next.config.jsを更新

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@mastra/*"], // ← 重要！
};

module.exports = nextConfig;
```

#### ステップ3: エージェントを定義

```typescript
// mastra/agents/assistant-agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切なAIアシスタントです。日本語で回答してください。",
  model: openai("gpt-4o-mini"),
});
```

#### ステップ4: Mastraインスタンスを作成

```typescript
// mastra/index.ts
import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistant-agent";

export const mastra = new Mastra({
  agents: {
    assistant: assistantAgent,
  },
});
```

#### ステップ5: Server Actionを作成

```typescript
// app/actions/chat.ts
"use server";
import { mastra } from "@/mastra";

export async function sendMessage(message: string) {
  const agent = mastra.getAgent("assistant");
  const result = await agent.generate(message);
  return result.text;
}
```

#### ステップ6: ページで使用

```typescript
// app/page.tsx
"use client";
import { useState } from "react";
import { sendMessage } from "./actions/chat";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ユーザーメッセージを追加
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    // AIの応答を取得
    const response = await sendMessage(input);
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    
    setInput("");
  };

  return (
    <main className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">AIチャット</h1>
      
      {/* メッセージ表示 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded ${
            msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
          }`}>
            <strong>{msg.role === "user" ? "あなた" : "AI"}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          送信
        </button>
      </form>
    </main>
  );
}
```

### アプローチ2: 別サーバー（Separate Backend）

**推奨用途:** 大規模プロジェクト、マイクロサービス

#### ステップ1: Mastraサーバーを作成

```bash
# 別ディレクトリにMastraプロジェクトを作成
mkdir my-project && cd my-project
npm create mastra@latest backend
cd backend
```

#### ステップ2: エージェントを定義（同上）

```typescript
// src/mastra/agents/assistant-agent.ts
import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";

export const assistantAgent = new Agent({
  name: "assistant",
  instructions: "あなたは親切なAIアシスタントです。",
  model: openai("gpt-4o-mini"),
});
```

```typescript
// src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistant-agent";

export const mastra = new Mastra({
  agents: { assistant: assistantAgent },
});
```

#### ステップ3: Mastraサーバーを起動

```bash
npm run dev
# http://localhost:4111 でAPIサーバーが起動
```

#### ステップ4: Next.jsクライアントを作成

```bash
cd ..
npx create-next-app@latest frontend
cd frontend
npm install @mastra/client-js
```

#### ステップ5: Mastraクライアントを設定

```typescript
// lib/mastra-client.ts
import { MastraClient } from "@mastra/client-js";

export const mastraClient = new MastraClient({
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_URL || "http://localhost:4111",
});
```

```bash
# .env.local
NEXT_PUBLIC_MASTRA_URL=http://localhost:4111
```

#### ステップ6: Next.jsで使用

```typescript
// app/page.tsx
"use client";
import { useState } from "react";
import { mastraClient } from "@/lib/mastra-client";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    
    // Mastraサーバーを呼び出し
    const agent = mastraClient.getAgent("assistant");
    const result = await agent.generate(input);
    
    setMessages(prev => [...prev, { role: "assistant", content: result.text }]);
    setInput("");
  };

  return (
    // ... 同じUIコード
  );
}
```

---

## チャットUIの実装

### 方法1: Vercel AI SDK UI（シンプル）

#### インストール

```bash
npm install @ai-sdk/react @mastra/ai-sdk
```

#### API Routeを作成

```typescript
// app/api/chat/route.ts
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const agent = mastra.getAgent("assistant");
  const stream = await agent.stream(messages, { 
    format: "aisdk" 
  });
  
  return stream.toUIMessageStreamResponse();
}
```

#### チャットUIコンポーネント

```typescript
// app/page.tsx
"use client";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AIチャット</h1>
      
      {/* メッセージ表示 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-500 text-white ml-auto max-w-[80%]"
                : "bg-gray-200 mr-auto max-w-[80%]"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-200 p-4 rounded-lg mr-auto max-w-[80%]">
            考え中...
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="メッセージを入力..."
          disabled={isLoading}
          className="flex-1 p-3 border rounded-lg"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
```

### 方法2: Assistant UI（高機能）

#### インストール

```bash
npx assistant-ui@latest create
# 既存プロジェクトの場合
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
```

#### API Route（同じ）

```typescript
// app/api/chat/route.ts
import { mastra } from "@/mastra";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const agent = mastra.getAgent("assistant");
  const stream = await agent.stream(messages, { format: "aisdk" });
  return stream.toUIMessageStreamResponse();
}
```

#### ページコンポーネント

```typescript
// app/page.tsx
"use client";
import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

export default function Home() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-screen">
        <Thread /> {/* 完全なチャットUI！ */}
      </div>
    </AssistantRuntimeProvider>
  );
}
```

---

## データベース設定

### オプション1: LibSQL（最も簡単）

開発環境や小規模デプロイに最適。

```typescript
// mastra/index.ts
import { Mastra } from "@mastra/core";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { assistantAgent } from "./agents/assistant-agent";

export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: "file:./mastra.db", // ファイルベース
  }),
  agents: {
    assistant: new Agent({
      ...assistantAgent,
      memory: new Memory({
        storage: new LibSQLStore({ url: "file:./mastra.db" }),
        vector: new LibSQLVector({ connectionUrl: "file:./mastra.db" }),
      }),
    }),
  },
});
```

### オプション2: PostgreSQL + pgvector（本番環境推奨）

#### PostgreSQLのインストール

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### pgvector拡張のインストール

```bash
# PostgreSQLに接続
psql postgres

# データベース作成
CREATE DATABASE mastra_db;
\c mastra_db

# pgvector拡張を有効化
CREATE EXTENSION vector;
```

#### Mastraで使用

```bash
npm install @mastra/pg
```

```typescript
// mastra/index.ts
import { Mastra } from "@mastra/core";
import { PostgresStore, PgVector } from "@mastra/pg";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";

const DB_URL = process.env.DATABASE_URL || "postgresql://localhost:5432/mastra_db";

export const mastra = new Mastra({
  storage: new PostgresStore({
    connectionString: DB_URL,
  }),
  agents: {
    assistant: new Agent({
      name: "assistant",
      instructions: "...",
      model: openai("gpt-4o-mini"),
      memory: new Memory({
        storage: new PostgresStore({ connectionString: DB_URL }),
        vector: new PgVector({ connectionString: DB_URL }),
        embedder: openai.embedding("text-embedding-3-small"),
        options: {
          lastMessages: 10,
          semanticRecall: {
            topK: 3,
            messageRange: 2,
          },
        },
      }),
    }),
  },
});
```

```bash
# .env.development
DATABASE_URL=postgresql://localhost:5432/mastra_db
OPENAI_API_KEY=sk-your-key-here
```

### オプション3: クラウドDB（Supabase）

```bash
# Supabaseプロジェクト作成後
npm install @mastra/pg
```

```typescript
// mastra/index.ts
import { PostgresStore, PgVector } from "@mastra/pg";

const mastra = new Mastra({
  storage: new PostgresStore({
    connectionString: process.env.SUPABASE_DB_URL,
  }),
});
```

```bash
# .env.development
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## デプロイ

### Vercelへのデプロイ（Next.js統合の場合）

#### ステップ1: プロジェクトをGitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

#### ステップ2: Vercelでインポート

1. https://vercel.com にアクセス
2. "Add New" → "Project"
3. GitHubリポジトリを選択
4. 環境変数を設定:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`（使用する場合）
5. "Deploy"をクリック

### スタンドアロンサーバーのデプロイ

#### Docker化

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4111

CMD ["node", ".mastra/output/index.mjs"]
```

```bash
# ビルドと起動
docker build -t my-mastra-app .
docker run -p 4111:4111 -e OPENAI_API_KEY=sk-xxx my-mastra-app
```

#### VPS/EC2へのデプロイ

```bash
# サーバーで
git clone https://github.com/yourusername/your-repo.git
cd your-repo
npm install
npm run build

# PM2で本番起動
npm install -g pm2
pm2 start .mastra/output/index.mjs --name "mastra-app"
pm2 save
pm2 startup
```

---

## トラブルシューティング

### よくある問題

#### 1. `Module not found: Can't resolve '@mastra/core'`

**解決策:**
```bash
npm install @mastra/core@latest
```

next.config.jsに以下を追加:
```javascript
serverExternalPackages: ["@mastra/*"]
```

#### 2. `LibSQLStore is not a constructor`

**解決策:**
```typescript
// 間違い
import LibSQLStore from "@mastra/libsql";

// 正しい
import { LibSQLStore } from "@mastra/libsql";
```

#### 3. PostgreSQLに接続できない

**解決策:**
```bash
# PostgreSQLが起動しているか確認
pg_isready

# 接続文字列を確認
psql postgresql://localhost:5432/mastra_db
```

#### 4. APIキーエラー

**解決策:**
```bash
# .env.developmentまたは.env.localが正しい場所にあるか確認
ls -la .env*

# 環境変数が読み込まれているか確認
echo $OPENAI_API_KEY
```

#### 5. チャットがストリーミングしない

**解決策:**
```typescript
// API Routeで format: "aisdk" を指定
const stream = await agent.stream(messages, { 
  format: "aisdk" // ← 重要！
});
```

### デバッグ方法

#### Mastraのログを有効化

```typescript
// mastra/index.ts
import { Mastra } from "@mastra/core";
import { PinoLogger } from "@mastra/loggers";

export const mastra = new Mastra({
  logger: new PinoLogger({
    level: "debug", // ← デバッグログを有効化
  }),
  agents: { ... },
});
```

#### ブラウザのDevToolsで確認

1. F12でDevToolsを開く
2. Networkタブで `/api/chat` のリクエストを確認
3. Consoleタブでエラーメッセージを確認

---

## 次のステップ

### 学習リソース

- 公式ドキュメント: https://mastra.ai/docs
- GitHubリポジトリ: https://github.com/mastra-ai/mastra
- Discord: https://discord.gg/mastra
- YouTube: Mastraチャンネル

### 追加機能の実装

1. **カスタムツールの追加**
   - データベース検索
   - 外部API呼び出し
   - ファイル処理

2. **RAGの実装**
   - 文書のチャンク化
   - ベクトル化
   - セマンティック検索

3. **ワークフローの作成**
   - 複数ステップの処理
   - 人間の承認待ち
   - 並列実行

4. **評価・モニタリング**
   - エージェントの精度測定
   - トレーシング
   - ログ分析

---

## まとめ

Mastraを使えば、TypeScriptだけで本格的なAIエージェントアプリケーションを構築できます。

**特徴:**
- 🚀 セットアップが簡単（5分で起動）
- 💪 本番環境対応（スケール可能）
- 🔧 フレキシブル（必要な機能だけ使える）
- 📚 ドキュメント充実
- 🤝 アクティブなコミュニティ

まずはローカルでプレイグラウンドを試し、その後Next.jsに統合してみましょう！

Happy coding! 🎉