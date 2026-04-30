export interface ChannelMessage {
  text: string;
  userId: string;
  chatId: string;
  platform: string;
  timestamp: Date;
}

export interface Channel {
  name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(chatId: string, text: string): Promise<void>;
  onMessage(handler: (msg: ChannelMessage) => void): void;
}