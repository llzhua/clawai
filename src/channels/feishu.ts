import * as lark from '@larksuiteoapi/node-sdk';
import express from 'express';
import { Channel, ChannelMessage } from './types';

export class FeishuChannel implements Channel {
  name = 'feishu';
  private client: lark.Client;
  private app: ReturnType<typeof express>;
  private server: any;
  private messageHandler?: (msg: ChannelMessage) => void;

  constructor(private appId: string, private appSecret: string) {
    this.client = new lark.Client({ appId, appSecret, disableTokenCache: false });
    this.app = express();
    // 同时支持 JSON 和其他格式
    this.app.use(express.json());
    this.app.use(express.text({ type: '*/*' }));
    this.setupRoutes();
  }

  onMessage(handler: (msg: ChannelMessage) => void): void {
    this.messageHandler = handler;
  }

  private setupRoutes(): void {
    this.app.post('/webhook/feishu', async (req, res) => {
      // 调试：打印收到的请求
      console.log('[飞书] 收到请求 Headers:', JSON.stringify(req.headers, null, 2));
      console.log('[飞书] 收到请求 Body:', req.body);

      let body = req.body;

      // 如果是字符串，尝试解析 JSON
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.log('[飞书] JSON 解析失败:', e);
          res.status(400).json({ error: 'Invalid JSON' });
          return;
        }
      }

      // URL 验证（首次配置回调时飞书会发送 challenge）
      if (body && body.type === 'url_verification') {
        console.log('[飞书] URL 验证通过, challenge:', body.challenge);
        res.json({ challenge: body.challenge });
        return;
      }

      // 处理消息事件
      const event = body?.event;
      if (event && this.messageHandler) {
        const msg = event.message;
        if (msg) {
          let text = '';
          try {
            const content = JSON.parse(msg.content || '{}');
            text = content.text || '';
          } catch {}

          if (text) {
            this.messageHandler({
              text,
              userId: event.sender?.sender_id?.user_id || '',
              chatId: msg.chat_id || '',
              platform: 'feishu',
              timestamp: new Date(),
            });
          }
        }
      }

      // 默认返回成功
      res.json({ code: 0 });
    });

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', channel: 'feishu' });
    });
  }

  async start(): Promise<void> {
    const port = parseInt(process.env.FEISHU_WEBHOOK_PORT || '3001');
    this.server = this.app.listen(port, () => {
      console.log(`[飞书] Webhook 监听端口 ${port}`);
      console.log(`[飞书] 回调地址: http://你的域名或IP:${port}/webhook/feishu`);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      console.log('[飞书] Bot 已停止');
    }
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      await this.client.im.message.create({
        params: { receive_id_type: 'chat_id' },
        data: {
          receive_id: chatId,
          msg_type: 'text',
          content: JSON.stringify({ text }),
        },
      });
    } catch (err) {
      console.error('[飞书] 发送消息失败:', err);
    }
  }
}