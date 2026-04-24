#!/usr/bin/env node
import { Command } from 'commander';
import { config } from 'dotenv';
config();
const program = new Command();
program
  .name('llzhua')
  .description('🐾 灵灵爪 - 开源全渠道 AI Agent 平台')
  .version('0.1.0');
program
  .command('start')
  .description('启动灵灵爪服务')
  .action(async () => {
    console.log('🐾 灵灵爪启动中...');
    console.log(`📡 端口: ${process.env.PORT || 3000}`);
    console.log('✅ 服务已启动');
  });
program
  .command('status')
  .description('查看服务状态')
  .action(() => {
    console.log('📊 服务状态: 运行中');
  });
program.parse();