/**
 * 🧠 DeepSeek LLM 客户端
 */

import OpenAI from 'openai';
import { loadConfig } from '../config/index.js';

export class DeepSeekClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    const config = loadConfig();
    this.model = config.llm.model || 'deepseek-chat';
    this.client = new OpenAI({
      apiKey: config.llm.apiKey,
      baseURL: config.llm.baseUrl || 'https://api.deepseek.com',
    });
  }

  async chat(message: string, systemPrompt?: string): Promise<string> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: message });

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '没有返回内容';
    } catch (error) {
      const err = error as Error;
      throw new Error(`DeepSeek API 调用失败: ${err.message}`);
    }
  }

  async chatWithHistory(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '没有返回内容';
    } catch (error) {
      const err = error as Error;
      throw new Error(`DeepSeek API 调用失败: ${err.message}`);
    }
  }
}