# dsh-better-sidebar-webview

> **DSH 内嵌真实浏览器 + Agent 直接读取/操作浏览器内容**
> 基于 [anywhere-labs/deepseek-harness-desktop](https://github.com/anywhere-labs/deepseek-harness-desktop)（DSH Desktop，Electron 桌面版）与 [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar)（MIT）的增强插件。

## ✨ 特性

| 能力 | 说明 |
|---|---|
| 🖥️ 内嵌真实浏览器（`<webview>`） | 独立 Chromium 渲染进程加载网页，**不受 `X-Frame-Options` 限制**——amazon.com 等拒绝被 iframe 嵌入的站点也能正常打开、登录，会话跨重启持久化 |
| 🤖 Agent 直接读浏览器 | 8 个 `webview_*` 工具：读 URL/标题/可见文本/可交互元素/截图，以及点击/输入/按键/滚动——**无需你手动截图**，模型直接操作左侧内嵌浏览器 |
| 🔧 一键运行时补丁 | 幂等、可回滚、自动定位 DSH Desktop 安装目录（`scripts/patch-desktop/`） |

## 🏗️ 架构（DSH Desktop + Electron）

本项目要解决的根问题是：**DSH 的内嵌浏览器内容是 Electron `<webview>`（独立渲染进程），外部插件/Agent 默认碰不到它**。整套方案分三层：

```
┌─────────────────────────────────────────────────────────────────────┐
│  DSH Desktop (anywhere-labs/deepseek-harness-desktop)                 │
│  = Electron 主进程 = Host Cordis root（官方 main.js 注释原话）          │
│                                                                       │
│  ┌────────────────────────────┐          ┌─────────────────────────┐  │
│  │  Renderer（web 界面）        │  ① 上报   │  Host（主进程，Node）    │  │
│  │  better-sidebar 侧边栏      │◄────────►│  Cordis root            │  │
│  │  └─ <webview> 内嵌浏览器    │ guestId  │  ├─ BrowserAutomation…  │  │
│  │     ├─ 加载 amazon/ERP 等   │          │  │   Service             │  │
│  │     └─ getWebContentsId()   │          │  ├─ webContents.fromId  │  │
│  └────────────────────────────┘          │  ├─ executeJavaScript   │  │
│                                           │  ├─ capturePage(截图)   │  │
│                                           │  └─ 注册 webview_* 工具  │  │
│                                           └───────────┬─────────────┘  │
│                                                       │ ② 模型调用工具   │
│                                                       ▼                 │
│                                              Agent（对话中的大模型）     │
└─────────────────────────────────────────────────────────────────────┘
```

**关键架构事实（为什么可行）：**

1. **DSH Desktop 的 Electron 主进程就是 dsh 的 Host 进程**。其 `main.js` 官方注释即 "minimal Electron bootstrap around the Host Cordis root"——所有 host 插件（包括本插件的 host 半边）都跑在 Electron 主进程内。
2. **因此 host 侧能直接 `webContents.fromId()` 拿到 `<webview>` 的 guest webContents**——executeJavaScript 读 DOM、capturePage 截图，全部在主进程完成，**不需要 CDP 端口、不需要 Playwright**。
3. **会话绑定**：渲染进程在 webview attach/导航时，把 `guest webContentsId` + 当前会话 `sessionId` 上报给 host（`browser.registerWebContents` RPC）；Agent 工具通过 `exec.agent.session.id` 定位对应 webContents——**绝不扫描/误操作未知页面**。
4. **为什么需要运行时补丁**（`scripts/patch-desktop/`）：
   - `webviewTag: true` 必须在 `BrowserWindow` 创建时设置（插件加载于窗口创建之后，无法自行开启）；
   - 原导航守卫 `will-frame-navigate`/`will-redirect` 会**连坐拦杀 webview guest 的 302/客户端跳转**（编译进桌面的版本丢了 `isMainFrame` 检查）→ 必须改成主 frame 专用的 `will-navigate`；
   - 补丁打在 DSH Desktop 运行时文件 `resources/app.asar.unpacked/lib/`（asar 里 `unpacked: true` = 真实磁盘文件，Electron 不校验完整性），幂等、自动备份 `*.dshwebview.bak`、`--restore` 可回滚。

**三块实现对应关系：**

| 层 | 文件 | 职责 |
|---|---|---|
| 运行时补丁 | `scripts/patch-desktop/patch-desktop.js` | 自动定位 DSH Desktop → 打 4 处补丁（webviewTag×2 + will-attach 放行 + 守卫改 will-navigate + 恢复窗口） |
| 客户端 webview | `src/client/BrowserView.tsx` | iframe → `<webview>`（`persist:` 分区持久化登录、Chrome UA 防反爬、absolute 贴齐容器），attach/导航时上报 webContentsId |
| Host 工具 | `src/browser-automation.ts` / `src/browser-automation-tools.ts` | `BrowserAutomationService` + 8 个 `webview_*` Agent 工具 |

## 📦 安装（DSH Desktop）

### 1. 安装插件（任选其一）
```bash
# npm 包方式
dsh plugin --profile web add dsh-better-sidebar-webview@latest
# 或本地目录（开发/分享）
# 把本仓库放到 ~/.dsh/profiles/web/node_modules/ 下并 pnpm install
```

### 2. 打运行时补丁（Windows 双击或命令行）
```bash
scripts\patch-desktop\run-patch.bat
# 或
node scripts/patch-desktop/patch-desktop.js --desktop-dir "D:\工具\DSH Desktop"   # 自动探测可省略
node scripts/patch-desktop/patch-desktop.js --check      # 检测是否已打
node scripts/patch-desktop/patch-desktop.js --restore    # 回滚
```

### 3. 彻底重启 DSH Desktop（含托盘）
补丁写入主进程运行时，必须完全退出后重启生效。

## 🎮 使用

浏览器标签加载任意页面（如 ERP/amazon），然后在对话里问 Agent：

> 「**读取我浏览器里当前打开的是什么页面**」→ Agent 调 `webview_get_page_info` + `webview_get_text`
>
> 「**这个页面上有哪些按钮/入口**」→ `webview_get_elements`
>
> 「**点一下『商品』按钮**」→ `webview_click`
>
> 「**截图看一下页面布局**」→ `webview_screenshot`（需视觉模型/vision-toolkit 配合分析）

## 🛠️ Agent 工具清单（8 个 `webview_*`）

| 工具 | 作用 | 安全等级 |
|---|---|---|
| `webview_get_page_info` | URL / 标题 / 能否前进后退 | 只读·自动 |
| `webview_get_text` | 页面可见文本（限长 20KB） | 只读·自动 |
| `webview_get_elements` | 可交互元素清单（编号索引，密码值 `[REDACTED]`） | 只读·自动 |
| `webview_screenshot` | 页面截图（base64 PNG） | 只读·自动 |
| `webview_click` | 按编号/文本/role+name/选择器点击 | 写操作 |
| `webview_type` | 输入文字（追加或替换） | 写操作 |
| `webview_press` | 按键（Enter/Tab/方向键等） | 写操作 |
| `webview_scroll` | 滚动（像素或顶部/底部） | 只读·自动 |

> 注：插件自带的 `browser_*`（Lum1104 Chrome 扩展桥）工具**仅在 Chrome 扩展连接后注册**，未连接时模型只见 `webview_*`，避免误用。

## 🔒 安全边界

- 只读操作自动允许；点击/输入/按键执行但 `password` 值一律 `[REDACTED]`
- 不返回 Cookie / LocalStorage / SessionStorage / 完整 HTML
- 不提供任意 `evaluate` 工具（固定功能工具，模型不能执行任意 JS）
- 所有工具绑定当前会话的 webview，绝不操作未知页面
- 会话/插件卸载时清理全部监听器与注册

## 🧭 常见问题

| 问题 | 处理 |
|---|---|
| 浏览器标签空白 / amazon 打不开 | 没打补丁或补丁被更新还原 → 重跑 `run-patch.bat` |
| Agent 报 "no active webview for this session" | 浏览器标签没打开过页面；打开后重新问 |
| Agent 报 "no browser extension is connected" | 模型误用 Chrome 桥工具；重启后新逻辑只留 `webview_*` |
| 严格站点点击无反应 | 合成点击 `isTrusted=false`，部分站点忽略；后续版本提供 CDP 真实输入事件 |
| 想用视觉模型看图 | 装 `@anionex/dsh-vision-toolkit`，配置 `glm-4v-flash` 或内置免费 Gemini 视觉 |

## 📄 License

MIT（保留上游 [omdsh-dev/DSH-better-sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 与 [Lum1104/dsh-browser](https://github.com/Lum1104/dsh-browser) 的许可声明）。
