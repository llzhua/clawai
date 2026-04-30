#!/usr/bin/env node
import { Command } from 'commander';
import { config } from 'dotenv';
import { DeepSeekClient } from './llm/index.js';
import { Bot } from './bot/index.js';
import { loadConfig } from './config/index.js';
import { createInterface } from 'node:readline';

// 全局异常处理，防止未捕获的错误导致进程崩溃
process.on('uncaughtException', (err) => {
  console.error('[全局异常] 未捕获的错误:', err.message);
  // 不退出进程，继续运行
});

config();

const program = new Command();

program
  .name('llzhua')
  .description('🐾 灵灵爪 - 开源全渠道 AI Agent 平台')
  .version('0.1.0');

// 启动服务命令
program
  .command('start')
  .description('启动灵灵爪服务')
  .action(async () => {
    const cfg = loadConfig();
    console.log('🐾 灵灵爪启动中...');
    console.log(`📡 端口: ${cfg.port}`);
    console.log(`🧠 LLM: ${cfg.llm.provider} (${cfg.llm.model})`);
    console.log(`💬 渠道: ${Object.keys(cfg.channels).filter(k => cfg.channels[k].enabled).join(', ') || '无'}`);

    const bot = new Bot(cfg);
    await bot.start();

    // 优雅退出
    const shutdown = async () => {
      console.log('\n🐾 正在关闭...');
      await bot.stop();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });

// 查看状态命令
program
  .command('status')
  .description('查看服务状态')
  .action(() => {
    console.log('📊 服务状态: 运行中');
    console.log(`🧠 LLM 提供商: ${process.env.LLM_PROVIDER || 'deepseek'}`);
    console.log(`🤖 模型: ${process.env.LLM_MODEL || 'deepseek-chat'}`);
  });

// 聊天命令 - 测试 DeepSeek API
program
  .command('chat')
  .description('与 AI 对话')
  .argument('[message]', '发送的消息')
  .action(async (message?: string) => {
    const client = new DeepSeekClient();

    // 单条消息模式
    if (message) {
      console.log(`\n🐾 灵灵爪思考中...\n`);
      try {
        const reply = await client.chat(
          message,
          '你是灵灵爪，一个友好、专业的AI助手。请用中文回答。',
        );
        console.log(`🤖 灵灵爪: ${reply}\n`);
      } catch (error) {
        console.error(`❌ 错误: ${(error as Error).message}`);
      }
      return;
    }

    // 交互式对话模式
    console.log('🐾 灵灵爪对话模式 (输入 "exit" 退出)\n');
    console.log('─────────────────────────────\n');

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '你: ',
    });

    const history: { role: 'user' | 'assistant'; content: string }[] = [];

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();

      if (input === 'exit' || input === 'quit') {
        console.log('\n🐾 再见！\n');
        rl.close();
        return;
      }

      if (!input) {
        rl.prompt();
        return;
      }

      history.push({ role: 'user', content: input });

      process.stdout.write('\n🐾 灵灵爪思考中...\n');

      try {
        const messages = [
          {
            role: 'system' as const,
            content: '你是灵灵爪，一个友好、专业的AI助手。请用中文回答。',
          },
          ...history,
        ];

        const reply = await client.chatWithHistory(messages);
        history.push({ role: 'assistant', content: reply });
        console.log(`\n🤖 灵灵爪: ${reply}\n`);
      } catch (error) {
        console.error(`\n❌ 错误: ${(error as Error).message}\n`);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      process.exit(0);
    });
  });

program.parse();