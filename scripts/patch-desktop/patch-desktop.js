#!/usr/bin/env node
/**
 * dsh-better-sidebar 桌面内嵌浏览器 —— DSH Desktop 运行时一键补丁脚本
 *
 * 背景：`<webview>` 必须在 Electron BrowserWindow 创建时开启（webviewTag），
 * 而 dsh-better-sidebar 是 web 平台插件，加载于窗口创建之后，无法自行开启。
 * 因此需要在 DSH Desktop 的运行时文件（app.asar.unpacked/lib/）上打 4 处补丁：
 *   1. 主窗口 webPreferences 加 `webviewTag: true`（compatibility + advanced）
 *   2. will-attach-webview 放行（去掉 preventDefault）
 *   3. 导航守卫 will-frame-navigate / will-redirect → 主 frame 专用 will-navigate
 *      （否则 webview guest 的 302/客户端跳转会被静默拦截 → 白屏）
 *   4. 启动恢复窗口（main.js）同样开启 webviewTag + 放行
 *
 * 特性：幂等（已打自动跳过）、自动备份（*.dshwebview.bak）、可回滚（--restore）、
 * 结果校验、自动探测 DSH Desktop 安装位置。
 *
 * 用法：
 *   node patch-desktop.js                # 打补丁（自动探测安装位置）
 *   node patch-desktop.js --desktop-dir "D:\工具\DSH Desktop"
 *   node patch-desktop.js --check        # 只检测是否已打补丁
 *   node patch-desktop.js --restore      # 从 .bak 还原（卸载/回滚）
 *   node patch-desktop.js --list         # 列出探测到的 DSH Desktop 位置
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const LIB_DIR = ['resources', 'app.asar.unpacked', 'lib']

/* ------------------------------------------------------------------ *
 * 1. 探测 DSH Desktop 安装目录
 * ------------------------------------------------------------------ */
const COMMON_HINTS = [
  'D:\\工具\\DSH Desktop',
  'D:\\DSH Desktop',
  'D:\\deepseek-harness-desktop\\DSH Desktop',
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'DSH Desktop'),
  'C:\\Program Files\\DSH Desktop',
  'C:\\Program Files (x86)\\DSH Desktop',
  'D:\\Program Files\\DSH Desktop',
].filter(Boolean)

function regQueryDesktopDirs() {
  const roots = [
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  ]
  const dirs = []
  for (const root of roots) {
    try {
      const out = execSync(`reg query "${root}" /s /f "DSH Desktop" /d`, {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 15000,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      for (const line of out.split(/\r?\n/)) {
        const m = line.match(/InstallLocation\s+REG_SZ\s+(.+)/i)
        if (m && fs.existsSync(m[1].trim())) dirs.push(m[1].trim())
      }
    } catch { /* registry key missing — ignore */ }
  }
  return dirs
}

function detectDesktopDirs() {
  const dirs = new Set()
  for (const hint of COMMON_HINTS) if (hint && fs.existsSync(hint)) dirs.add(path.resolve(hint))
  for (const d of regQueryDesktopDirs()) dirs.add(d)
  return [...dirs]
}

function findRuntimeDir(desktopDir) {
  const candidate = path.join(desktopDir, ...LIB_DIR)
  return fs.existsSync(candidate) ? candidate : null
}

/* ------------------------------------------------------------------ *
 * 2. 定位 electron-runtime chunk（文件名带 hash，按内容特征找）
 * ------------------------------------------------------------------ */
function findElectronRuntimeChunk(libDir) {
  let files
  try { files = fs.readdirSync(libDir) } catch { return null }
  for (const f of files) {
    if (!f.endsWith('.js') || f.endsWith('.map') || f === 'main.js') continue
    const p = path.join(libDir, f)
    let content = ''
    try { content = fs.readFileSync(p, 'utf8') } catch { continue }
    // 特征：含守卫（will-frame-navigate / will-redirect）或窗口选项构建（desktopWindowOptions）
    if (/will-frame-navigate|will-redirect|desktopWindowOptions/.test(content) && /webPreferences/.test(content)) {
      return p
    }
  }
  return null
}

/* ------------------------------------------------------------------ *
 * 3. 补丁操作（幂等 + 备份）
 * ------------------------------------------------------------------ */
const INDENT = '\t\t\t'
const ATTACH_PERMIT =
  `${INDENT}webPreferences.nodeIntegration = false;\n` +
  `${INDENT}webPreferences.contextIsolation = true;\n` +
  `${INDENT}webPreferences.sandbox = true;`

function backup(file) {
  const bak = `${file}.dshwebview.bak`
  if (!fs.existsSync(bak)) fs.copyFileSync(file, bak)
  return bak
}

/** 幂等打补丁，返回 { file, actions: string[] } */
function patchRuntimeChunk(file) {
  let content = fs.readFileSync(file, 'utf8')
  const actions = []

  // (a) webviewTag: true —— 幂等：已存在则跳过
  if (!content.includes('webviewTag: true')) {
    const m = content.match(/(\n[ \t]*webSecurity:[ \t]*true)/)
    if (m) {
      const indent = m[1].match(/[ \t]+$/)[0] || INDENT
      content = content.replace(m[1], `${m[1]},${indent}webviewTag: true`)
      actions.push('webviewTag: true')
    } else {
      actions.push('!webSecurity 特征未找到（跳过 webviewTag）')
    }
  } else {
    actions.push('webviewTag: true (已存在)')
  }

  // (b) will-attach-webview 放行 —— 幂等：无 preventDefault 且已放行则跳过
  if (content.includes('will-attach-webview')) {
    if (/will-attach-webview[\s\S]{0,200}preventDefault\(\)/.test(content)) {
      // 替换 handler 内的 preventDefault 调用为放行设置
      content = content.replace(/event\.preventDefault\(\)/g, ATTACH_PERMIT)
      actions.push('will-attach-webview 放行（去掉 preventDefault + 强制隔离）')
    } else {
      actions.push('will-attach-webview (已放行)')
    }
  } else {
    actions.push('!无 will-attach-webview handler（跳过）')
  }

  // (c) 导航守卫：will-frame-navigate / will-redirect → will-navigate
  // 只处理真实注册/解绑调用（.on("...")/.off("...")），注释里的旧名字忽略
  if (/\.(?:on|off)\(["']will-(?:frame-navigate|redirect)["']/.test(content)) {
    let before = content
    // 注册：will-frame-navigate → will-navigate；will-redirect → 删除（主 frame 已由 will-navigate 覆盖）
    content = content.replace(/\.on\(["']will-frame-navigate["'],\s*\w+\)/g, '.on("will-navigate", navigate)')
    content = content.replace(/\.on\(["']will-redirect["'],\s*\w+\)/g, '')
    // cleanup：off 同步
    content = content.replace(/\.off\(["']will-frame-navigate["'],\s*\w+\)/g, '.off("will-navigate", navigate)')
    content = content.replace(/\.off\(["']will-redirect["'],\s*\w+\)/g, '')
    if (content !== before) actions.push('守卫 will-frame-navigate/will-redirect → will-navigate')
    else actions.push('!守卫替换无变化（格式不匹配）')
  } else {
    actions.push('守卫 (已为主 frame 专用)')
  }

  if (content !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, content)
  return { file, actions }
}

function patchRecoveryWindow(file) {
  let content = fs.readFileSync(file, 'utf8')
  const actions = []

  if (content.includes('webviewTag: false')) {
    content = content.replace(/webviewTag:\s*false/g, 'webviewTag: true')
    actions.push('恢复窗口 webviewTag: false → true')
  } else if (content.includes('webviewTag: true')) {
    actions.push('恢复窗口 webviewTag: true (已开启)')
  } else {
    actions.push('!恢复窗口无 webviewTag（跳过）')
  }

  if (content.includes('will-attach-webview') && /will-attach-webview[\s\S]{0,200}preventDefault\(\)/.test(content)) {
    content = content.replace(/event\.preventDefault\(\)/g, ATTACH_PERMIT)
    actions.push('恢复窗口 will-attach-webview 放行')
  } else {
    actions.push('恢复窗口 will-attach-webview (已放行或不存在)')
  }

  if (content !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, content)
  return { file, actions }
}

/* ------------------------------------------------------------------ *
 * 4. 校验
 * ------------------------------------------------------------------ */
function verify(file) {
  const content = fs.readFileSync(file, 'utf8')
  // 只匹配真实注册/解绑调用（.on(". ..")/.off("...")），避免注释里的字样误报
  const guardCall = (name) => new RegExp(`\\.(?:on|off)\\(["']${name}["']`).test(content)
  return {
    webviewTagTrue: (content.match(/webviewTag:\s*true/g) || []).length,
    webviewTagFalse: (content.match(/webviewTag:\s*false/g) || []).length,
    frameNavigateGuard: guardCall('will-frame-navigate'),
    redirectGuard: guardCall('will-redirect'),
    mainFrameGuard: (content.match(/\.(?:on|off)\(["']will-navigate["']/g) || []).length,
    attachPermit: /will-attach-webview/.test(content) && !/will-attach-webview[\s\S]{0,200}preventDefault\(\)/.test(content),
  }
}

/* ------------------------------------------------------------------ *
 * 5. main
 * ------------------------------------------------------------------ */
const args = process.argv.slice(2)
const mode = args.includes('--restore') ? 'restore'
  : args.includes('--check') ? 'check'
  : args.includes('--list') ? 'list'
  : 'patch'
const explicitDir = (() => {
  const i = args.indexOf('--desktop-dir')
  return i >= 0 ? args[i + 1] : process.env.DSH_DESKTOP_DIR
})()

function log(msg) { console.log(msg) }

function run() {
  if (mode === 'list') {
    const dirs = detectDesktopDirs()
    log('探测到的 DSH Desktop 目录：')
    if (dirs.length === 0) log('  （未找到，可用 --desktop-dir "路径" 指定）')
    for (const d of dirs) log(`  - ${d}`)
    return
  }

  const dirs = explicitDir ? [path.resolve(explicitDir)] : detectDesktopDirs()
  if (dirs.length === 0) {
    log('[错误] 未自动找到 DSH Desktop 安装目录，请用：')
    log('  node patch-desktop.js --desktop-dir "D:\\工具\\DSH Desktop"')
    process.exit(1)
  }

  let anyTarget = false
  for (const desktop of dirs) {
    const libDir = findRuntimeDir(desktop)
    if (!libDir) { log(`\n[跳过] ${desktop}：无 ${LIB_DIR.join('/')} 目录`); continue }
    log(`\n=== DSH Desktop: ${desktop} ===`)

    if (mode === 'restore') {
      const baks = fs.readdirSync(libDir).filter(f => f.endsWith('.dshwebview.bak'))
      if (baks.length === 0) { log('  无备份文件，无需回滚'); continue }
      for (const b of baks) {
        const orig = b.replace(/\.dshwebview\.bak$/, '')
        fs.copyFileSync(path.join(libDir, b), path.join(libDir, orig))
        log(`  [还原] ${orig} ← ${b}`)
      }
      log('  已回滚（重启 DSH Desktop 生效）')
      continue
    }

    const chunk = findElectronRuntimeChunk(libDir)
    if (!chunk) { log('  [跳过] 未找到 electron-runtime chunk（版本结构不同？）'); continue }
    const mainJs = path.join(libDir, 'main.js')

    log(`  运行时 chunk: ${path.basename(chunk)}`)
    if (mode === 'check') {
      const v = verify(chunk)
      const vm = fs.existsSync(mainJs) ? verify(mainJs) : { webviewTagTrue: -1 }
      log(`  主窗口: webviewTag:true×${v.webviewTagTrue} | 恢复窗口: webviewTag:true×${vm.webviewTagTrue}`)
      log(`  守卫: will-frame-navigate=${v.frameNavigateGuard} will-redirect=${v.redirectGuard} will-navigate×${v.mainFrameGuard}`)
      log(`  attach 放行: ${v.attachPermit ? '✅' : '❌（仍被 preventDefault）'}`)
      const ok = v.webviewTagTrue >= 2 && v.attachPermit && !v.frameNavigateGuard && v.mainFrameGuard >= 1
      log(ok ? '  ✅ 已完整打补丁' : '  ⚠️ 未打补丁或部分缺失（运行 node patch-desktop.js 补上）')
      continue
    }

    // patch mode
    backup(chunk)
    const r = patchRuntimeChunk(chunk)
    log(`  [补丁] ${r.actions.join('；')}`)
    if (fs.existsSync(mainJs)) {
      backup(mainJs)
      const rm = patchRecoveryWindow(mainJs)
      log(`  [补丁] ${rm.actions.join('；')}`)
    }

    const v = verify(chunk)
    const ok = v.webviewTagTrue >= 2 && v.attachPermit && !v.frameNavigateGuard && !v.redirectGuard
    log(ok ? '  ✅ 校验通过（重启 DSH Desktop 生效）' : `  ⚠️ 校验异常: ${JSON.stringify(v)}`)
    anyTarget = true
  }

  if (mode === 'patch' && anyTarget) {
    log('\n提示：补丁已写入，请完全退出 DSH Desktop（含托盘）后重启。')
    log('回滚：node patch-desktop.js --restore（保留 *.dshwebview.bak）')
  }
}

try { run() } catch (e) { log(`[错误] ${e.message}`); process.exit(1) }
