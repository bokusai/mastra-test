import { Mastra } from '@mastra/core';
import { assistantAgent } from './agents/assistant-agent';

export const mastra = new Mastra({
  agents: {
    assistant: assistantAgent,
  },
});
