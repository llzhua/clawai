import { WechatyBuilder } from 'wechaty';
import { WechatyPuppetWechat4u } from 'wechaty-puppet-wechat4u';
import { Channel, ChannelMessage } from './types';
export class WeChatChannel implements Channel {
  name = 'wechat';
  private bot: any;
  private messageHandler?: (msg: ChannelMessage) => void;
  constructor() {
    this.bot = WechatyBuilder.build({
      name: 'llzhua-wechat',
      puppet: 'wechaty-puppet-wechat4u',
    });
  }
  onMessage(handler: (msg: ChannelMessage) => void): void {
    this.messageHandler = handler;
  }
  async start(): Promise<void> {
    this.bot.on('scan', (qrcode: string, status: number) => {
      const qrcodeUrl = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`\n[微信] 请扫码登录: ${qrcodeUrl}\n`);
      console.log(`[微信] 或复制下方链接到浏览器生成二维码:`);
      console.log(`[微信] https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}&size=300x300\n`);
    });
    this.bot.on('login', (user: any) => {
      console.log(`[微信] ${user.name()} 已登录`);
    });
    this.bot.on('message', async (msg: any) => {
      if (!this.messageHandler) return;
      if (msg.type() !== 7) return;
      if (msg.self()) return;
      const room = msg.room();
      const chatId = room ? room.id : msg.talker().id;
      this.messageHandler({
        text: msg.text(),
        userId: msg.talker().id,
        chatId,
        platform: 'wechat',
        timestamp: new Date(),
      });
    });
    await this.bot.start();
  }
  async stop(): Promise<void> {
    await this.bot.stop();
    console.log('[微信] Bot 已停止');
  }
  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      const contact = await this.bot.Contact.find({ id: chatId });
      if (contact) {
        await contact.say(text);
      } else {
        const room = await this.bot.Room.find({ id: chatId });
        if (room) {
          await room.say(text);
        }
      }
    } catch (err) {
      console.error('[微信] 发送消息失败:', err);
    }
  }
}