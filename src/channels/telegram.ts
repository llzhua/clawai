import { Telegraf } from 'telegraf'; 
import { HttpsProxyAgent } from 'https-proxy-agent'; 
import { Channel, ChannelMessage } from './types'; 
 
export class TelegramChannel implements Channel {
  name = 'telegram';
  private bot: Telegraf;
  private messageHandler?: (msg: ChannelMessage) => void; 

  constructor(token: string) {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    const options = proxy ? { telegram: { agent: new HttpsProxyAgent(proxy) } } : {};
    this.bot = new Telegraf(token, options as any);
  } 

  onMessage(handler: (msg: ChannelMessage) => void): void {
    this.messageHandler = handler;
  } 

  async start(): Promise<void> {
    this.bot.on('text', (ctx) => {
      if (this.messageHandler) {
        this.messageHandler({
          text: ctx.message.text,
          userId: String(ctx.from.id),
          chatId: String(ctx.chat.id),
          platform: 'telegram',
          timestamp: new Date(),
        });
      }
    }); 

    await this.bot.launch();
    console.log('[Telegram] Bot 已启动');
  } 

  async stop(): Promise<void> {
    this.bot.stop('shutdown');
    console.log('[Telegram] Bot 已停止');
  } 

  async sendMessage(chatId: string, text: string): Promise<void> {
    await this.bot.telegram.sendMessage(chatId, text);
  } 
}