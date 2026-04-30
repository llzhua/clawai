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
    baseUrl: string;
    model: string;
  };
  channels: {
    telegram?: { token: string; enabled: boolean };
    feishu?: { appId: string; appSecret: string; enabled: boolean };
    wechat?: { token: string; enabled: boolean };
    wecom?: {
      corpId: string;
      agentId: string;
      secret: string;
      token: string;
      encodingAESKey: string;
      port: number;
      enabled: boolean;
    };
    [key: string]: any;
  };
}
export function loadConfig(): AppConfig {
  const provider = process.env.LLM_PROVIDER || 'deepseek';
  const llmConfigs: Record<string, { apiKey: string; baseUrl: string; model: string }> = {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.LLM_MODEL || 'deepseek-chat',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
      model: process.env.LLM_MODEL || 'gpt-4',
    },
  };
  const llmConfig = llmConfigs[provider] || llmConfigs.deepseek;
  return {
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      url: process.env.DATABASE_URL || 'sqlite://./data/llzhua.db',
    },
    llm: {
      provider,
      ...llmConfig,
    },
    channels: {
      telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN || '',
        enabled: !!process.env.TELEGRAM_BOT_TOKEN,
      },
      feishu: {
        appId: process.env.FEISHU_APP_ID || '',
        appSecret: process.env.FEISHU_APP_SECRET || '',
        enabled: !!(process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET),
      },
      wechat: {
        token: '',
        enabled: process.env.WECHAT_ENABLED === 'true',
      },
      wecom: {
        corpId: process.env.WECOM_CORP_ID || '',
        agentId: process.env.WECOM_AGENT_ID || '',
        secret: process.env.WECOM_SECRET || '',
        token: process.env.WECOM_TOKEN || '',
        encodingAESKey: process.env.WECOM_ENCODING_AES_KEY || '',
        port: parseInt(process.env.WECOM_PORT || '3002'),
        enabled: !!(process.env.WECOM_CORP_ID && process.env.WECOM_SECRET),
      },
    },
  };
}