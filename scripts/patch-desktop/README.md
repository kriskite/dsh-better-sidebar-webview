# 桌面内嵌浏览器补丁（DSH Desktop 专用）

`dsh-better-sidebar` 的浏览器标签在 **DSH Desktop（Electron 桌面版）** 里默认是 iframe 形态，会被
`X-Frame-Options` 拦掉（amazon.com 等打不开）。本补丁把 DSH Desktop 运行时切换为真实
`<webview>`（独立 Chromium 进程），网页可正常加载、可登录、会话持久化。

> 浏览器标签的 `<webview>` 渲染逻辑已经内嵌在插件客户端里（`BrowserView.tsx`），**无需任何插件改动**；
> 本脚本只负责给 DSH Desktop 的运行时文件打补丁（webview 必须在窗口创建时开启，插件自身做不到）。

## 用法

### Windows：双击运行
```
scripts\patch-desktop\run-patch.bat
```
或命令行：
```
node scripts/patch-desktop/patch-desktop.js
node scripts/patch-desktop/patch-desktop.js --desktop-dir "D:\工具\DSH Desktop"   # 指定安装目录
```

### 其他命令
| 命令 | 作用 |
|---|---|
| `--check` | 检测是否已打补丁 |
| `--restore` | 回滚（恢复 `.dshwebview.bak` 备份） |
| `--list` | 列出自动探测到的 DSH Desktop 位置 |

## 补丁内容（4 处，幂等）
| # | 文件 | 改动 |
|---|---|---|
| 1 | electron-runtime chunk（文件名带 hash，按内容自动定位） | 主窗口 webPreferences 加 `webviewTag: true`（compatibility + advanced） |
| 2 | 同上 | `will-attach-webview` 放行 + guest 强制隔离 |
| 3 | 同上 | 导航守卫 `will-frame-navigate`/`will-redirect` → 主 frame 专用 `will-navigate`（否则 webview 跳转被静默拦截 → 白屏） |
| 4 | main.js | 启动恢复窗口同样开启 webviewTag + 放行 |

每次打补丁前自动备份 `*.dshwebview.bak`；DSH Desktop 更新会覆盖运行时文件，更新后重新运行本脚本即可。

## 平台说明
- **DSH Desktop（Electron）**：跑一次补丁脚本 → 浏览器标签变真实 webview，amazon/baidu 都能开。
- **纯 Web 版 dsh（浏览器里）**：无 Electron，webview 不可用，浏览器标签自动回退 iframe（打不开的站会提示「外部打开」）。
- 若 amazon.com 被反爬拦截（网络出口为机房 IP 等），需让 webview 走代理：给 DSH Desktop 配置系统代理，或命令级注入 `HTTPS_PROXY`。
