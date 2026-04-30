import { TelegramChannel } from '../channels/telegram';
import { FeishuChannel } from '../channels/feishu';
import { WeChatChannel } from '../channels/wechat';
import { WecomChannel } from '../channels/wecom';
import { Channel, ChannelMessage } from '../channels/types';
import { DeepSeekClient } from '../llm/index.js';
import { AppConfig } from '../config';
export class Bot {
  private channels: Map<string, Channel> = new Map();
  private llm: DeepSeekClient;
  constructor(private config: AppConfig) {
    this.llm = new DeepSeekClient();
  }
  async start(): Promise<void> {
    // 先启动非阻塞渠道（飞书、企微、微信）
    // 飞书
    const feishuAppId = this.config.channels.feishu?.appId;
    const feishuAppSecret = this.config.channels.feishu?.appSecret;
    if (feishuAppId && feishuAppSecret) {
      try {
        const feishu = new FeishuChannel(feishuAppId, feishuAppSecret);
        feishu.onMessage((msg) => this.handleMessage(msg, feishu));
        this.channels.set('feishu', feishu);
        await feishu.start();
      } catch (err) {
        console.error('[飞书] 启动失败:', err);
      }
    }
    // 企业微信
    const wecomCorpId = this.config.channels.wecom?.corpId;
    const wecomSecret = this.config.channels.wecom?.secret;
    if (wecomCorpId && wecomSecret) {
      try {
        const wecom = new WecomChannel({
          corpId: wecomCorpId,
          agentId: this.config.channels.wecom!.agentId!,
          secret: wecomSecret,
          token: this.config.channels.wecom!.token!,
          encodingAESKey: this.config.channels.wecom!.encodingAESKey!,
          port: this.config.channels.wecom?.port || 3002,
        });
        wecom.onMessage((msg) => this.handleMessage(msg, wecom));
        this.channels.set('wecom', wecom);
        await wecom.start();
      } catch (err) {
        console.error('[企微] 启动失败:', err);
      }
    }
    // 微信
    if (this.config.channels.wechat?.enabled) {
      try {
        const wechat = new WeChatChannel();
        wechat.onMessage((msg) => this.handleMessage(msg, wechat));
        this.channels.set('wechat', wechat);
        await wechat.start();
      } catch (err) {
        console.error('[微信] 启动失败:', err);
      }
    }
    // Telegram 放最后启动（launch 是阻塞的）
    const tgToken = this.config.channels.telegram?.token;
    if (tgToken) {
      try {
        const telegram = new TelegramChannel(tgToken);
        telegram.onMessage((msg) => this.handleMessage(msg, telegram));
        this.channels.set('telegram', telegram);
        await telegram.start();
      } catch (err) {
        console.error('[Telegram] 启动失败:', err);
      }
    }
    const names = [...this.channels.keys()].join(', ');
    console.log(`[Bot] 已启动 ${this.channels.size} 个渠道: ${names || '无'}`);
  }
  private async handleMessage(msg: ChannelMessage, channel: Channel): Promise<void> {
    console.log(`[${msg.platform}] 用户 ${msg.userId}: ${msg.text}`);
    try {
      const reply = await this.llm.chat(
        msg.text,
        '你是灵灵爪，一个友好、专业的AI助手。请用中文回答。',
      );
      await channel.sendMessage(msg.chatId, reply);
      console.log(`[${msg.platform}] 回复: ${reply}`);
    } catch (err) {
      console.error(`[${msg.platform}] 处理失败:`, err);
      await channel.sendMessage(msg.chatId, '抱歉，处理出错了，请稍后再试。');
    }
  }
  async stop(): Promise<void> {
    for (const [name, ch] of this.channels) {
      await ch.stop();
    }
  }
}