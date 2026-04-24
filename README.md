# 🐾 灵灵爪 (LLZHUA)

### 开源全渠道 AI Agent 平台

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/llzhua/clawai)](https://github.com/llzhua/clawai)

[快速开始](#快速开始) • [文档](docs/) • [路线图](#路线图)

---

## ✨ 什么是灵灵爪？

灵灵爪是一个**开源全渠道 AI Agent 平台**，让你轻松构建、部署和管理智能 AI 代理。

### 核心特性

- 🌐 **全渠道接入** — WhatsApp、Telegram、Discord、Slack、Signal、微信、飞书
- 🧠 **深度记忆系统** — 持久化记忆，跨会话上下文理解
- 🌍 **浏览器自动化** — 网页抓取、表单填写、自动化操作
- ⚡ **工作流编排** — 可视化 Agent 工作流，支持定时任务
- 🔌 **插件生态** — 模块化扩展，自定义技能和工具
- 🔒 **私有部署** — 数据完全掌控，支持 Docker 一键部署
- 🤖 **多 Agent 协作** — ACP 协议支持 Agent 间通信

---

## 🚀 快速开始

### Docker 一键启动

```bash
git clone https://github.com/llzhua/clawai.git
cd clawai
docker-compose up -d
open http://localhost:3000
手动安装
git clone https://github.com/llzhua/clawai.git

cd clawai

pnpm install

cp .env.example .env

pnpm dev

📦 功能模块
灵灵爪
├── 🌐 多渠道网关     — 统一消息收发，支持 7+ 平台
├── 🤖 Agent 引擎     — 智能代理定义、行为管理
├── 🧠 记忆系统       — 短期/长期记忆，上下文理解
├── 🔧 工具箱         — 浏览器、终端、文件操作
├── ⚡ 工作流引擎     — 可视化编排，定时任务
├── 📊 管理后台       — 监控、配置、数据分析
└── 🔌 插件市场       — 社区技能和扩展
🗺 路线图
v0.1.0 — MVP
[ ] 核心 Agent 引擎
[ ] Telegram 渠道接入
[ ] 基础记忆系统
[ ] Web 管理后台
v0.2.0 — 扩展
[ ] WhatsApp / Discord 渠道
[ ] 浏览器自动化
[ ] 工作流可视化编辑器
[ ] 插件 SDK
📄 许可证
MIT License
Made with 🐾 by 灵灵爪团队