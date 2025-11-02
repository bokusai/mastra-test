import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const assistantAgent = new Agent({
  name: 'assistant',
  instructions: 'あなたは親切なAIアシスタントです。日本語で丁寧に回答してください。',
  model: anthropic('claude-3-5-haiku-20241022'),
});
