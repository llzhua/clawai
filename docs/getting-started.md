# 🚀 灵灵爪快速开始指南



本指南将帮助你在 5 分钟内启动灵灵爪。



---



## 📋 环境要求



| 依赖 | 最低版本 | 推荐版本 |

|------|---------|---------|

| Node.js | 20.0+ | 22.0+ |

| pnpm | 8.0+ | 9.0+ |

| Docker（可选） | 24.0+ | 最新 |



---



## 方式一：Docker 部署（推荐）



最简单的方式，适合快速体验和生产部署。



### 1. 克隆项目



```bash

git clone https://github.com/llzhua/clawai.git

cd clawai

2. 配置环境变量
cp .env.example .env

编辑 .env 文件，填入必要配置：
# 至少配置一个 LLM 提供商的 API Key
OPENAI_API_KEY=sk-your-key-here

# 至少启用一个消息渠道
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
3. 启动服务
docker-compose up -d

4. 验证运行状态
# 查看日志

docker-compose logs -f app



# 访问管理界面

# 浏览器打开 http://localhost:3000

看到以下输出表示启动成功：
🐾 灵灵爪启动中...
📡 端口: 3000
✅ 服务已启动
🌐 管理界面: http://localhost:3000
方式二：本地开发
适合开发者进行二次开发和调试。
1. 克隆项目
git clone https://github.com/llzhua/clawai.git

cd clawai

2. 安装依赖
pnpm install

3. 配置环境变量
cp .env.example .env

# 编辑 .env 填入你的配置

4. 启动开发服务器
pnpm dev

修改代码后会自动热重载。
5. 运行测试
# 运行所有测试

pnpm test



# 运行测试并查看覆盖率

pnpm test --coverage

🌐 配置消息渠道
Telegram
在 Telegram 中找到 @BotFather
发送 /newbot 创建新机器人
获取 Bot Token
在 .env 中配置：
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
重启服务，向你的 Bot 发送消息测试
Discord
访问 Discord Developer Portal
创建新应用 → 添加 Bot
获取 Bot Token
在 .env 中配置：
DISCORD_BOT_TOKEN=your-discord-bot-token
使用 OAuth2 URL 将 Bot 邀请到你的服务器
WhatsApp
安装依赖（需要扫描二维码绑定）
在 .env 中配置：
WHATSAPP_ENABLED=true
首次启动时会在终端显示二维码，用手机 WhatsApp 扫描即可绑定
🤖 创建你的第一个 Agent
通过配置文件
创建 agents/my-agent.yaml：
name: 我的助手

model: gpt-4

systemPrompt: |

  你是一个友好的AI助手，专门帮助用户解答问题。

  请用中文回答，保持简洁有帮助。  



tools:

  - web-search

  - calculator

  - file-reader



memory: true

通过管理界面
打开 http://localhost:3000
点击「创建 Agent」
填写名称、选择模型、编写系统提示词
选择需要的工具
点击「保存并启用」
🧠 记忆系统
灵灵爪的记忆系统分为两层：
短期记忆
当前会话的上下文
自动管理，无需配置
默认保留最近 100 条消息
长期记忆
跨会话持久化存储
支持语义搜索
自动将重要信息归档
配置长期记忆存储：
# SQLite（默认，轻量级）
DATABASE_URL=sqlite://./data/llzhua.db

# PostgreSQL（生产推荐）
DATABASE_URL=postgresql://user:pass@localhost:5432/llzhua
🔧 内置工具
在 Agent 配置中启用工具：
tools:

  - web-search

  - browser

  - calculator

⚡ 工作流示例
创建一个定时任务工作流：
workflows/daily-report.yaml：
name: 每日报告

trigger: schedule

schedule: "0 9 * * *"  # 每天早上 9 点



steps:

  - name: 收集数据

    type: tool

    config:

      tool: web-search

      params:

        query: "AI行业最新动态"



  - name: 生成报告

    type: agent

    config:

      agent: my-agent

      prompt: "根据搜索结果生成一份简报"



  - name: 发送报告

    type: tool

    config:

      tool: send-message

      params:

        channel: telegram

        content: "{{steps.generate-report.output}}"

🐛 常见问题
Q: 启动时报端口占用错误
# 查看占用端口的进程

lsof -i :3000



# 或者修改端口

PORT=3001 pnpm dev

Q: API Key 无效
检查 .env 文件中的 Key 是否正确
确认 Key 有足够的额度和权限
检查是否有空格或换行符
Q: 消息渠道连接失败
检查 Token 是否正确
确认网络能访问对应平台
查看日志获取详细错误信息
docker-compose logs -f app | grep ERROR

Q: Docker 构建失败
# 清理缓存重新构建

docker-compose build --no-cache

docker-compose up -d

📚 下一步
渠道配置详解
Agent 开发指南
插件开发
API 参考文档
生产部署指南
💬 获取帮助
🐛 GitHub Issues
💬 Discord 社区
📧 邮件联系
Made with 🐾 by 灵灵爪团队