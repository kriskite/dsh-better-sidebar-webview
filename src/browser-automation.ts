/**
 * BrowserAutomationService —— 让 Agent 直接读取/操作 DSH 左侧内嵌 webview。
 *
 * 架构前提（已实测确认）：DSH Desktop 的 Electron 主进程就是 dsh 的 Host
 * Cordis root（main.js 注释 "minimal Electron bootstrap around the Host
 * Cordis root"），因此本插件 host 半边跑在 Electron 主进程内，可以直接
 * `webContents.fromId()` 拿到 better-sidebar 内嵌浏览器（<webview>）的
 * guest webContents，用 executeJavaScript / capturePage 读取与操作页面——
 * 不需要 Playwright / CDP 端口。
 *
 * 会话边界：所有操作都绑定到「client 上报的当前激活 webview 的
 * webContentsId」（按会话 sessionId 维度存一份），绝不扫描全部 webContents
 * 乱操作。工具名用 webview_* 前缀，避免与既有 browser_*（外部 Chrome 桥）
 * 冲突。
 *
 * 安全边界（按 browser-automation-plan.md）：
 *  - 只读操作（info/text/elements/screenshot/scroll）自动允许；
 *  - 写操作（click/type/press）执行，但 password 字段值一律 [REDACTED]；
 *  - 不返回 Cookie/LocalStorage/SessionStorage/完整 HTML；
 *  - 不提供任意 evaluate 工具；
 *  - 文本/元素数量/截图尺寸全部设上限。
 */
import { createRequire } from 'node:module'

// electron 只在 Electron 主进程可用；纯 Node（web 版 dsh）下不可用 → 守卫。
let electronModule: { webContents?: { fromId(id: number): unknown } } | null = null
try {
  const req = createRequire(import.meta.url)
  const mod = req('electron')
  if (mod && mod.webContents) electronModule = mod
} catch {
  // 纯 Node 环境（web 版）：electron 不可用，服务进入降级模式。
}

export const WEBVIEW_TOOL_NAMES = [
  'webview_get_page_info',
  'webview_get_text',
  'webview_get_elements',
  'webview_screenshot',
  'webview_click',
  'webview_type',
  'webview_press',
  'webview_scroll',
] as const

export interface WebviewPageInfo {
  webContentsId: number
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
}

/** 元素摘要（页面注入脚本的返回形状）。 */
interface ElementSummary {
  index: number
  tag: string
  role: string
  name: string
  text: string
  placeholder: string
  href: string
  disabled: boolean
  visible: boolean
  inputType: string
  rect: { x: number; y: number; w: number; h: number }
}

/** 从页面收集可交互元素摘要（注入 guest 主 frame 执行）。 */
const COLLECT_ELEMENTS_JS = `(() => {
  const REDACTED = '[REDACTED]'
  const els = [...document.querySelectorAll(
    'button,a,input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="radio"]'
  )]
  return els.slice(0, 300).map((el, index) => {
    const tag = el.tagName.toLowerCase()
    const type = tag === 'input' ? (el.type || 'text') : ''
    const value = (el.value !== undefined && el.value !== null) ? String(el.value) : ''
    const rect = el.getBoundingClientRect()
    return {
      index,
      tag,
      role: el.getAttribute('role') || (tag === 'button' ? 'button' : tag === 'a' ? 'link' : tag === 'input' ? 'textbox' : tag === 'select' ? 'combobox' : tag === 'textarea' ? 'textbox' : ''),
      name: (el.getAttribute('aria-label') || '').slice(0, 120),
      text: (el.innerText || el.textContent || '').trim().slice(0, 120),
      placeholder: el.getAttribute('placeholder') || '',
      href: el.getAttribute('href') || '',
      disabled: !!el.disabled,
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      inputType: type,
      value: type === 'password' ? REDACTED : value.slice(0, 120),
    }
  })
})()`

/** 定位可交互元素（按 index / text / role+name / selector 优先级）。 */
const LOCATE_JS = (locator: string): string => `(() => {
  const spec = ${locator}
  const els = [...document.querySelectorAll(
    'button,a,input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="radio"]'
  )]
  let el = null
  if (typeof spec.index === 'number') el = els[spec.index]
  else if (spec.text) el = els.find(e => (e.innerText || '').trim() === spec.text || (e.value && String(e.value).trim() === spec.text))
  else if (spec.role && spec.name) el = els.find(e => ((e.getAttribute('role') || e.tagName.toLowerCase()) === spec.role) && ((e.getAttribute('aria-label') || e.innerText || '').trim() === spec.name))
  else if (spec.selector) { try { el = document.querySelector(spec.selector) } catch {} }
  return el ? { ok: true, index: els.indexOf(el), tag: el.tagName.toLowerCase(), text: (el.innerText || '').trim().slice(0, 120) } : { ok: false }
})()`

const MAX_TEXT_BYTES = 20000
const MAX_ELEMENTS = 300

/** 截断到字节上限且不切断多字节字符。 */
function bound(text: string, maxBytes: number): { text: string; truncated: boolean } {
  const buf = Buffer.from(text, 'utf8')
  if (buf.byteLength <= maxBytes) return { text, truncated: false }
  let end = maxBytes
  while (end > 0 && ((buf[end] ?? 0) & 0xc0) === 0x80) end -= 1
  return { text: buf.subarray(0, end).toString('utf8'), truncated: true }
}

/** 把注入脚本结果规整成有限 JSON 的普通值。 */
function sanitize(value: unknown): unknown {
  if (typeof value === 'string') return bound(value, MAX_TEXT_BYTES).text
  return value
}

export class BrowserAutomationService {
  /** sessionId → 当前激活 webview 的 guest webContentsId */
  private readonly bySession = new Map<string, number>()

  /** client 上报：把某会话的「当前激活 webview」绑定到 guest webContentsId。 */
  registerWebContents(sessionId: string, webContentsId: number): void {
    if (typeof webContentsId !== 'number' || !Number.isFinite(webContentsId)) return
    this.bySession.set(sessionId, webContentsId)
  }

  unregisterSession(sessionId: string): void {
    this.bySession.delete(sessionId)
  }

  get available(): boolean {
    return electronModule !== null
  }

  /** 解析当前会话的 guest webContents；无 electron / 未上报时返回 null。 */
  private webContentsOf(sessionId: string): { fromId(id: number): unknown } | null {
    if (!electronModule?.webContents) return null
    const id = this.bySession.get(sessionId)
    return id !== undefined ? electronModule.webContents : null
  }

  /** 会话维度上下文：webContents + 当前 URL/标题。 */
  private ctxOf(sessionId: string): { wc: any; url: string; title: string; id: number } | null {
    if (!electronModule?.webContents) return null
    const id = this.bySession.get(sessionId)
    if (id === undefined) return null
    const wc = electronModule.webContents.fromId(id)
    if (!wc || wc.isDestroyed()) return null
    return { wc, url: wc.getURL() || '', title: wc.getTitle() || '', id }
  }

  /** 用于工具出错时排查：暴露 service 当前状态（available + 已注册 sessionId 映射）。 */
  diagnose(): { available: boolean; registeredSessionIds: string[]; mappedWebContentsIds: number[] } {
    const ids: string[] = []
    for (const k of this.bySession.keys()) { if (ids.length < 5) ids.push(k); else ids.push('…') }
    const mapped: number[] = []
    for (const v of this.bySession.values()) { if (mapped.length < 5) mapped.push(v); else mapped.push(-1) }
    return { available: electronModule !== null, registeredSessionIds: ids, mappedWebContentsIds: mapped }
  }

  /** 抛「no active webview」时附带诊断信息，便于排查 sessionId 不匹配 / 未上报 / host 不在主进程。 */
  private noWebviewError(sessionId: string): Error {
    return new Error(`no active webview for this session (sessionId=${sessionId}; ${JSON.stringify(this.diagnose())})`)
  }

  async getPageInfo(sessionId: string): Promise<WebviewPageInfo> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    return {
      webContentsId: ctx.id,
      url: ctx.url,
      title: ctx.title,
      canGoBack: typeof ctx.wc.canGoBack === 'function' ? !!ctx.wc.canGoBack() : false,
      canGoForward: typeof ctx.wc.canGoForward === 'function' ? !!ctx.wc.canGoForward() : false,
    }
  }

  async getPageText(sessionId: string, maxLength = MAX_TEXT_BYTES): Promise<{ url: string; title: string; text: string; truncated: boolean }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const raw = await ctx.wc.executeJavaScript(`(() => { const t = document.body ? document.body.innerText : ''; return typeof t === 'string' ? t : '' })()`, true)
    const bounded = bound(String(raw ?? ''), Math.min(maxLength, MAX_TEXT_BYTES))
    return { url: ctx.url, title: ctx.title, ...bounded }
  }

  async getPageElements(sessionId: string): Promise<{ url: string; elements: ElementSummary[]; truncated: boolean }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const raw = await ctx.wc.executeJavaScript(COLLECT_ELEMENTS_JS, true)
    const list: ElementSummary[] = Array.isArray(raw) ? raw : []
    const truncated = list.length >= 300
    return { url: ctx.url, elements: list.slice(0, MAX_ELEMENTS), truncated }
  }

  async takeScreenshot(sessionId: string): Promise<{ mimeType: string; base64: string; width: number; height: number }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const image = await ctx.wc.capturePage()
    const size = image.getSize()
    return { mimeType: 'image/png', base64: image.toPNG().toString('base64'), width: size.width, height: size.height }
  }

  /** 定位并点击（合成 click；严格站点可能忽略 isTrusted=false 的事件）。 */
  async click(sessionId: string, locator: { index?: number; text?: string; role?: string; name?: string; selector?: string }): Promise<{ ok: boolean; element?: { tag: string; text: string } }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const found = await ctx.wc.executeJavaScript(LOCATE_JS(JSON.stringify(locator)), true)
    if (!found?.ok) return { ok: false }
    await ctx.wc.executeJavaScript(`(() => { const spec = ${JSON.stringify(locator)}; const els=[...document.querySelectorAll('button,a,input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="radio"]')]; const el = els[spec.index]; if (!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true })()`, true)
    return { ok: true, element: { tag: String(found.tag), text: String(found.text || '') } }
  }

  /** 输入文字（focus + 原生 setter + input/change 事件）。password 值不返回。 */
  async type(sessionId: string, locator: { index?: number; text?: string; role?: string; name?: string; selector?: string }, text: string, replace = false): Promise<{ ok: boolean }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const js = `(() => { const spec = ${JSON.stringify(locator)}; const TEXT = ${JSON.stringify(text)}; const els=[...document.querySelectorAll('button,a,input,select,textarea,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="checkbox"],[role="radio"]')]; const el = (typeof spec.index === 'number' ? els[spec.index] : (spec.text ? els.find(e => (e.innerText||'').trim() === spec.text || (e.value && String(e.value).trim() === spec.text)) : (spec.role && spec.name ? els.find(e => ((e.getAttribute('role')||e.tagName.toLowerCase()) === spec.role) && ((e.getAttribute('aria-label')||e.innerText||'').trim() === spec.name)) : (spec.selector ? document.querySelector(spec.selector) : null)))); if (!el || el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && !el.isContentEditable) return false; el.focus(); const setter = Object.getOwnPropertyDescriptor(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? window.HTMLInputElement.prototype : window.HTMLInputElement.prototype, 'value') || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value'); if (setter && setter.set) setter.set.call(el, ${replace ? 'TEXT' : '(el.value || "") + TEXT'}); else el.value = ${replace ? 'TEXT' : '(el.value || "") + TEXT'}; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true })()`
    const ok = await ctx.wc.executeJavaScript(js, true)
    return { ok: !!ok }
  }

  /** 按键（KeyboardEvent 合成）。 */
  async press(sessionId: string, key: string): Promise<{ ok: boolean }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const ok = await ctx.wc.executeJavaScript(`(() => { const k = ${JSON.stringify(key)}; const t = document.activeElement || document.body; t.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })); t.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true })); return true })()`, true)
    return { ok: !!ok }
  }

  /** 滚动页面。 */
  async scroll(sessionId: string, deltaY?: number, to?: 'top' | 'bottom'): Promise<{ ok: boolean }> {
    const ctx = this.ctxOf(sessionId)
    if (!ctx) throw this.noWebviewError(sessionId)
    const ok = await ctx.wc.executeJavaScript(`(() => { if (${to ? 'true' : 'false'}) { window.scrollTo({ top: ${to === 'bottom' ? 'document.body.scrollHeight' : '0'}, behavior: 'auto' }); return true } window.scrollBy({ top: ${Number(deltaY) || 0}, behavior: 'auto' }); return true })()`, true)
    return { ok: !!ok }
  }
}
