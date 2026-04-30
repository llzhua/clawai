import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { Channel, ChannelMessage } from './types';

interface WecomConfig {
  corpId: string;
  agentId: string;
  secret: string;
  token: string;
  encodingAESKey: string;
  port?: number;
}

export class WecomChannel implements Channel {
  name = 'wecom';
  private app: express.Application;
  private server: any;
  private messageHandler?: (msg: ChannelMessage) => void;
  private accessToken?: string;
  private tokenExpiresAt = 0;
  private aesKey: Buffer;
  private iv: Buffer;

  constructor(private config: WecomConfig) {
    this.app = express();
    this.app.use(express.text({ type: '*/*' }));
    // 从 EncodingAESKey 计算 AES 密钥
    this.aesKey = Buffer.from(config.encodingAESKey + '=', 'base64');
    this.iv = this.aesKey.slice(0, 16);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // 验证回调（GET 请求）
    this.app.get('/wecom', (req: Request, res: Response) => {
      try {
        const msgSignature = req.query.msg_signature as string;
        const timestamp = req.query.timestamp as string;
        const nonce = req.query.nonce as string;
        const echostr = req.query.echostr as string;

        // 调试日志
        console.log('[企微调试] 收到验证请求');
        console.log('[企微调试] msg_signature:', msgSignature);
        console.log('[企微调试] timestamp:', timestamp);
        console.log('[企微调试] nonce:', nonce);
        console.log('[企微调试] echostr 原始:', echostr);

        // URL decode
        const decodedEchostr = decodeURIComponent(echostr);
        console.log('[企微调试] echostr 解码后:', decodedEchostr);

        // 验证签名
        const expectedSig = this.generateSignature(timestamp, nonce, decodedEchostr);
        console.log('[企微调试] 计算的签名:', expectedSig);
        console.log('[企微调试] Token:', this.config.token);

        if (expectedSig !== msgSignature) {
          console.error('[企微] 签名验证失败');
          res.status(403).send('签名验证失败');
          return;
        }

        // 解密 echostr，提取 msg 字段
        const decrypted = this.decrypt(decodedEchostr);
        // 解密后格式: random(16字节) + msg_len(4字节) + msg + CorpID
        const msgLen = decrypted.readUInt32BE(16);
        const msg = decrypted.slice(20, 20 + msgLen).toString('utf8');

        console.log('[企微] 回调验证成功');
        // 1秒内原样返回明文，不能加引号，不能带bom头，不能带换行符
        res.type('text/plain').send(msg);
      } catch (err) {
        console.error('[企微] 验证失败:', err);
        res.status(500).send('验证失败');
      }
    });

    // 接收消息（POST 请求）
    this.app.post('/wecom', (req: Request, res: Response) => {
      try {
        const msgSignature = req.query.msg_signature as string;
        const timestamp = req.query.timestamp as string;
        const nonce = req.query.nonce as string;
        const xml = req.body;

        // 从 XML 提取 Encrypt 字段
        const encryptMatch = xml.match(/<Encrypt><!\[CDATA\[(.*?)\]\]><\/Encrypt>/);
        if (!encryptMatch) {
          res.send('success');
          return;
        }
        const encrypt = encryptMatch[1];

        // 验证签名
        const expectedSig = this.generateSignature(timestamp, nonce, encrypt);
        if (expectedSig !== msgSignature) {
          console.error('[企微] 消息签名验证失败');
          res.send('success');
          return;
        }

        // 解密消息
        const decrypted = this.decrypt(encrypt);
        const msgLen = decrypted.readUInt32BE(16);
        const msgXml = decrypted.slice(20, 20 + msgLen).toString('utf8');
        // CorpID 在末尾，用于验证
        const corpId = decrypted.slice(20 + msgLen).toString('utf8');
        if (corpId !== this.config.corpId) {
          console.error('[企微] CorpID 不匹配');
          res.send('success');
          return;
        }

        console.log('[企微] 收到消息:', msgXml);
        this.parseMessage(msgXml);

        // 返回空串表示接收成功，不回复用户
        // 如需被动回复，需构造加密的响应包
        res.send('success');
      } catch (err) {
        console.error('[企微] 处理消息失败:', err);
        res.send('success');
      }
    });

    // 健康检查
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', channel: 'wecom' });
    });
  }

  private parseMessage(xml: string): void {
    const msgTypeMatch = xml.match(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/);
    const msgType = msgTypeMatch?.[1];

    if (msgType === 'text') {
      const contentMatch = xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/);
      const fromUserMatch = xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/);
      const createTimeMatch = xml.match(/<CreateTime>(\d+)<\/CreateTime>/);

      const content = contentMatch?.[1] || '';
      const fromUser = fromUserMatch?.[1] || '';
      const createTime = createTimeMatch?.[1] || '0';

      if (content && this.messageHandler) {
        this.messageHandler({
          text: content,
          userId: fromUser,
          chatId: fromUser,
          platform: 'wecom',
          timestamp: new Date(parseInt(createTime) * 1000),
        });
      }
    } else if (msgType === 'event') {
      console.log('[企微] 收到事件:', xml.substring(0, 200));
    }
  }

  // 生成签名
  private generateSignature(timestamp: string, nonce: string, encrypt: string): string {
    const arr = [this.config.token, timestamp, nonce, encrypt].sort();
    return crypto.createHash('sha1').update(arr.join('')).digest('hex');
  }

  // AES-256-CBC 解密（PKCS7 填充）
  private decrypt(encrypt: string): Buffer {
    const encryptedBuf = Buffer.from(encrypt, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.iv);
    let decrypted = Buffer.concat([decipher.update(encryptedBuf), decipher.final()]);
    return decrypted;
  }

  // 获取 access_token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.config.corpId}&corpsecret=${this.config.secret}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.errcode !== 0) {
      throw new Error(`获取 access_token 失败: ${data.errmsg}`);
    }

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    console.log('[企微] 获取 access_token 成功');
    return this.accessToken;
  }

  async start(): Promise<void> {
    const port = this.config.port || 3002;
    // 先获取一次 access_token 验证配置
    await this.getAccessToken();
    this.server = this.app.listen(port, () => {
      console.log(`[企微] Webhook 监听端口 ${port}`);
      console.log(`[企微] 回调地址: http://你的域名或IP:${port}/wecom`);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }

  // 主动发送消息
  async sendMessage(userId: string, text: string): Promise<void> {
    const token = await this.getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`;

    const body = {
      touser: userId,
      msgtype: 'text',
      agentid: this.config.agentId,
      text: { content: text },
      safe: 0,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.errcode !== 0) {
      console.error('[企微] 发送消息失败:', data.errmsg);
      throw new Error(data.errmsg);
    }
  }

  onMessage(handler: (msg: ChannelMessage) => void): void {
    this.messageHandler = handler;
  }
}