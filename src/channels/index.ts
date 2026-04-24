/**
 * 🌐 渠道管理器
 * 统一管理多平台消息收发
 */
export type ChannelType = 'telegram' | 'discord' | 'whatsapp' | 'slack' | 'signal' | 'wechat' | 'feishu';
export interface Message {
  id: string;
  channel: ChannelType;
  sender: string;
  content: string;
  timestamp: Date;
}
export interface Channel {
  type: ChannelType;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(message: Message): Promise<void>;
  onMessage(callback: (message: Message) => void): void;
}
export class ChannelManager {
  private channels: Map<ChannelType, Channel> = new Map();
  register(channel: Channel): void {
    this.channels.set(channel.type, channel);
    console.log(`🌐 渠道已注册: ${channel.name}`);
  }
  async broadcast(message: Message): Promise<void> {
    for (const channel of this.channels.values()) {
      await channel.sendMessage(message);
    }
  }
}