/**
 * ⚙️ 配置管理
 */
export interface AppConfig {
  port: number;
  logLevel: string;
  database: {
    url: string;
  };
  llm: {
    provider: string;
    apiKey: string;
    model: string;
  };
  channels: Record<string, { token: string; enabled: boolean }>;
}
export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      url: process.env.DATABASE_URL || 'sqlite://./data/llzhua.db',
    },
    llm: {
      provider: process.env.LLM_PROVIDER || 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.LLM_MODEL || 'gpt-4',
    },
    channels: {},
  };
}