# 逢7过 · SevenPass

考验反应力与专注力的数字游戏，支持 iOS 与 Android。

🌐 **官网** → [shuaihuadu.github.io/sevenpass](https://shuaihuadu.github.io/sevenpass)

## 关于

遇到含 7 的数字或 7 的倍数，说「过」；否则报出数字。数字越来越快，能坚持多久？

## 下载

| 平台 | 链接 |
| ---- | ---- |
| iOS | App Store（即将上线） |
| Android | [GitHub Releases](https://github.com/shuaihuadu/sevenpass/releases/latest) |

## 本仓库

存放官网落地页，通过 GitHub Pages 托管于 `docs/` 目录。

关卡越高，数字范围越大、时限越短。

## 项目结构

\sevenpass/
├── game.js                   # 小游戏入口
├── game.json                 # 小游戏配置
├── project.config.json       # 开发者工具配置
├── js/
│   ├── main.js               # 游戏主循环（Canvas 初始化、场景管理）
│   ├── scenes/
│   │   ├── StartScene.js     # 开始界面（难度选择）
│   │   └── GameScene.js      # 游戏主场景（逢7过核心逻辑）
│   ├── managers/
│   │   └── AudioManager.js   # 音频管理器
│   └── utils/
│       └── index.js          # 工具函数（isSevenNumber、isDigitSumSeven、存档等）
├── images/                   # 游戏图片资源
└── audio/                    # 游戏音频资源
\
## 技术栈

- 微信小游戏原生 Canvas 2D API
- ES6 模块化（import / export）
- 无第三方依赖，轻量纯原生

## 快速开始

1. 用微信开发者工具打开本项目
2. 在 \project.config.json\ 中确认 AppID
3. 点击「预览」在手机上查看效果
