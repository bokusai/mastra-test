'use server';

import { mastra } from '@/mastra';
import type { CoreMessage } from 'ai';

export async function sendMessage(messages: CoreMessage[]) {
  const agent = mastra.getAgent('assistant');

  // 通常のレスポンスを取得
  const result = await agent.generate(messages);

  return { text: result.text };
}
