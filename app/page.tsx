'use client';

import { useState } from 'react';
import { sendMessage } from './actions/chat';
import type { CoreMessage } from 'ai';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Server Actionを呼び出し
      const coreMessages: CoreMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: input },
      ];
      const { text } = await sendMessage(coreMessages);

      // AIのメッセージを追加
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: text,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold">Mastra チャットアプリ</h1>

      {/* メッセージ表示 */}
      <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-4 ${
              message.role === 'user'
                ? 'ml-auto max-w-[80%] bg-blue-500 text-white'
                : 'mr-auto max-w-[80%] bg-gray-200 text-gray-900'
            }`}
          >
            <div className="mb-1 text-sm font-semibold">
              {message.role === 'user' ? 'あなた' : 'AI'}
            </div>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="mr-auto max-w-[80%] rounded-lg bg-gray-200 p-4 text-gray-900">
            <div className="mb-1 text-sm font-semibold">AI</div>
            <div>考え中...</div>
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={isLoading}
          className="flex-1 rounded-lg border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          送信
        </button>
      </form>
    </div>
  );
}
