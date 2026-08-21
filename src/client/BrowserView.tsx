/**
 * The built-in browser tab: an address bar plus an in-app browser.
 *
 * Rendering strategy (decided per environment):
 *  - Inside the DSH Desktop (Electron with <webview> enabled) we mount a real
 *    Electron <webview> element. It is a full Chromium renderer loaded
 *    directly (NOT an iframe), so sites that block embedding via
 *    X-Frame-Options / frame-ancestors — e.g. www.amazon.com — load and stay
 *    interactive with their own login/session (persist: partition). This is
 *    the WorkBuddy-style embedded browser living in the right sidebar.
 *  - Elsewhere (pure web UI, or builds without <webview>) we fall back to the
 *    original sandboxed <iframe> with the X-Frame-Options refusal panel.
 *
 * Security: the <webview> guest runs isolated (no node integration, opaque
 * guest context) and is only attached because the desktop shell enables
 * webviewTag and allows will-attach-webview. The address bar only accepts
 * http(s) and refuses loopback / the GUI's own origin.
 *
 * The URL is persisted onto the tab (path/title via the patchTab reducer)
 * so a reload restores the visited page.
 */
import { useEffect, useRef, useState } from 'react'

function desktopInvoke<T>(command: string, args: Record<string, unknown>): Promise<T> | undefined {
  const invoke = (globalThis as { __TAURI_INTERNALS__?: { invoke?: (name: string, args?: unknown) => Promise<unknown> } }).__TAURI_INTERNALS__?.invoke
  return invoke?.(command, args) as Promise<T> | undefined
}
import {
  IconChevronLeftOutline14,
  IconChevronRightOutline14,
  IconGlobeOutline14,
  IconLinkOutline14,
  IconRefreshOutline14,
  IconRightUpOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { api } from './api.ts'
import { embeddabilityOf, normalizeBrowserUrl } from './browser.ts'
import { openTabInActivePane, patchTab } from './state.ts'
import { SandboxStatusBar } from './SandboxStatusBar.tsx'
import { t } from './locales.ts'
import type { TabComponentProps } from './service.ts'
import css from './sidebar.module.css'

/**
 * The browser iframe sandbox tokens. NO allow-same-origin (opaque origin —
 * no GUI storage/API access), NO allow-top-navigation (a browsed page must
 * not hijack the GUI). allow-forms/allow-popups/allow-downloads/allow-modals
 * keep login flows working; allow-popups-to-escape-sandbox lets OAuth
 * popups open as normal tabs (they are cross-origin to the GUI either way).
 * Only used by the non-webview iframe fallback.
 */
export const BROWSER_IFRAME_SANDBOX =
  'allow-scripts allow-forms allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox'

/** Minimal shape of Electron's <webview> guest we drive imperatively. */
type WebviewTag = HTMLElement & {
  src: string
  getURL(): string
  goBack(): void
  goForward(): void
  reload(): void
  stop(): void
  isLoading(): boolean
  /** Electron <webview> zoom controls (renderer-callable, no host needed). */
  setZoomFactor?: (factor: number) => Promise<void>
  getZoomFactor?: () => Promise<number>
}

/** Zoom range and step for the address-bar zoom controls. */
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.1
/** Per-host zoom memory (localStorage, global across sessions). */
const ZOOM_STORE_KEY = 'dsh-browser-zoom-by-host'

/** Browser bookmarks (localStorage, global across sessions). */
const BOOKMARKS_STORE_KEY = 'dsh-browser-bookmarks'

interface BrowserBookmark { url: string; title: string; addedAt: number }

function bookmarksRead(): BrowserBookmark[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_STORE_KEY) ?? '[]') as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((b): b is BrowserBookmark =>
      typeof b === 'object' && b !== null &&
      typeof (b as BrowserBookmark).url === 'string' &&
      typeof (b as BrowserBookmark).title === 'string'
    )
  } catch {
    return []
  }
}

function bookmarksWrite(list: BrowserBookmark[]): void {
  try { localStorage.setItem(BOOKMARKS_STORE_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

/**
 * Guest preload: captured Ctrl+wheel inside the <webview> (the guest is a
 * separate renderer; wheel never bubbles to the parent). Works in a
 * sandboxed guest — Electron's sandboxed preloads still get a polyfilled
 * `require('electron').ipcRenderer`. Written to the session workspace and
 * referenced via the webview `preload` attribute (file:// URL).
 */
const ZOOM_PRELOAD_FILENAME = '.dsh-browser-zoom-preload.js'
const ZOOM_PRELOAD_JS = `const { ipcRenderer } = require('electron');
window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    ipcRenderer.sendToHost('zoom-wheel', e.deltaY);
  }
}, { passive: false, capture: true });
`

function zoomStoreRead(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(ZOOM_STORE_KEY) ?? '{}') as unknown
    return parsed !== null && typeof parsed === 'object' ? parsed as Record<string, number> : {}
  } catch {
    return {}
  }
}

function zoomStoreWrite(map: Record<string, number>): void {
  try { localStorage.setItem(ZOOM_STORE_KEY, JSON.stringify(map)) } catch { /* storage full/blocked: ignore */ }
}

function hostOf(raw: string): string | null {
  try { return new URL(raw).hostname } catch { return null }
}

/** True when the hosting Electron shell has <webview> tags enabled. */
function webviewSupported(): boolean {
  return typeof customElements !== 'undefined' && customElements.get('webview') !== undefined
}

// A generic Chrome UA so anti-bot heuristics on sites like amazon.com do not
// flag the Electron user agent.
const WEBVIEW_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

export function BrowserView(props: TabComponentProps) {
  const { store, tab } = props
  // The current address (initialized from the persisted tab.path so a
  // reload restores the visited page).
  const [url, setUrl] = useState<string | undefined>(tab.path)
  const [input, setInput] = useState<string>(tab.path ?? '')
  /** Blocked/invalid hint shown under the address bar (null = none). */
  const [message, setMessage] = useState<string | null>(null)
  /** Address-bar navigation history (in-frame clicks are not tracked). */
  const [history, setHistory] = useState<string[]>(tab.path !== undefined ? [tab.path] : [])
  const [cursor, setCursor] = useState<number>(tab.path !== undefined ? 0 : -1)
  /** Bumped on reload to remount the iframe (also remounts on sandbox flip). */
  const [reloadKey, setReloadKey] = useState(0)
  /** TEMPORARY sandbox unlock for THIS surface only (never writes the global
   *  side card setting; lasts until the tab unmounts or the user restores). */
  const [localUnlock, setLocalUnlock] = useState(false)
  const noSandbox = store.getPrefs().browserNoSandbox === true || localUnlock
  /** A site that refuses to be embedded (X-Frame-Options / frame-ancestors):
   *  the probe verdict shown instead of the blank iframe. */
  const [embedBlocked, setEmbedBlocked] = useState<string | null>(null)
  /** The user asked to load the refused site anyway (keeps the plain iframe). */
  const [forceEmbed, setForceEmbed] = useState(false)
  /** Page zoom factor (1 = 100%). Applied to the <webview> via setZoomFactor
   *  and remembered per hostname (localStorage). Ctrl+wheel is captured by a
   *  guest preload (ipcRenderer.sendToHost) because wheel events inside the
   *  webview guest never bubble to the parent page. */
  const [zoom, setZoom] = useState(1)
  /** Live zoom value for event handlers created inside the mount effect. */
  /** Open the bookmarks overlay (false = closed). */
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  /** Force-refresh key for the bookmarks overlay list. */
  const [bookmarksVersion, setBookmarksVersion] = useState(0)
  const currentUrl = url ?? ''
  const currentHost = hostOf(currentUrl) ?? ''
  const isCurrentBookmarked = currentUrl !== '' && bookmarksRead().some(b => b.url === currentUrl)
  const toggleBookmark = (): void => {
    if (currentUrl === '') return
    const list = bookmarksRead()
    const idx = list.findIndex(b => b.url === currentUrl)
    if (idx >= 0) list.splice(idx, 1)
    else {
      let title = currentHost || currentUrl
      try { title = new URL(currentUrl).hostname || title } catch { /* keep */ }
      const liveTitle = webviewRef.current?.getTitle?.()
      list.unshift({ url: currentUrl, title: typeof liveTitle === 'string' && liveTitle !== '' ? liveTitle : title, addedAt: Date.now() })
    }
    bookmarksWrite(list)
    setBookmarksVersion(v => v + 1)
  }
  /** Open a URL in a new browser tab inside the sidebar. */
  const openInNewTab = (nextUrl: string): void => {
    let host = ''
    try { host = new URL(nextUrl).hostname } catch { /* keep empty */ }
    store.reduce(state => openTabInActivePane(state, {
      id: `browser:${nextUrl}`,
      type: 'browser',
      title: host || nextUrl,
      path: nextUrl,
    }))
  }
  const zoomRef = useRef(1)
  const persistZoomForHost = (factor: number): void => {
    // Read the live guest URL (ref stays fresh across navigation) so this
    // works from both the button handler and the guest zoom events.
    const live = webviewRef.current?.getURL?.() ?? url
    const host = hostOf(live ?? '')
    if (host === null) return
    const map = zoomStoreRead()
    map[host] = factor
    zoomStoreWrite(map)
  }
  const applyZoom = (next: number): void => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    zoomRef.current = clamped
    setZoom(clamped)
    persistZoomForHost(clamped)
    void webviewRef.current?.setZoomFactor?.(clamped).catch(() => { /* web build: no-op */ })
  }
  /** Ctrl+wheel delta from the guest preload (ipc-message channel). */
  const zoomWheel = (delta: number): void => {
    applyZoom(zoomRef.current + (delta > 0 ? -ZOOM_STEP : ZOOM_STEP))
  }
  const applyZoomForHost = (targetUrl: string): void => {
    const host = hostOf(targetUrl)
    if (host === null) return
    const saved = zoomStoreRead()[host]
    if (typeof saved !== 'number' || !Number.isFinite(saved)) return
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, saved))
    setZoom(clamped)
    void webviewRef.current?.setZoomFactor?.(clamped).catch(() => { /* web build: no-op */ })
  }
  /** The extension bridge drives a real Chrome tab, so frame-blocking headers
   * do not apply. Poll lightly because the extension may connect after mount. */
  const [bridgeConnected, setBridgeConnected] = useState(false)
  const desktopAvailable = (): boolean => {
    const globals = globalThis as { __DSH_DESKTOP__?: boolean; __TAURI_INTERNALS__?: unknown }
    return globals.__DSH_DESKTOP__ === true || globals.__TAURI_INTERNALS__ !== undefined
  }
  const [isDesktop, setIsDesktop] = useState(desktopAvailable)
  /** Real-browser surface refs (Electron <webview> only). */
  const containerRef = useRef<HTMLDivElement | null>(null)
  const webviewRef = useRef<WebviewTag | null>(null)
  // Real-browser readiness: poll for the <webview> custom element. Electron
  // registers it asynchronously after the page boots, so a single render-time
  // check (customElements.get('webview')) can miss it and strand us on the
  // iframe / desktop fallback. Once available we mount the real in-app browser.
  const [webviewReady, setWebviewReady] = useState<boolean>(webviewSupported())
  const [webviewTimedOut, setWebviewTimedOut] = useState<boolean>(false)
  useEffect(() => {
    if (webviewReady) return
    let tries = 0
    let timer: number | undefined
    const check = (): void => {
      if (webviewSupported()) { setWebviewReady(true); return }
      if (tries++ < 50) timer = window.setTimeout(check, 100)
      else {
        setWebviewTimedOut(true)
        if (isDesktop) console.warn('[DSH] <webview> element never became available — the desktop runtime may not have webviewTag enabled.')
      }
    }
    check()
    return () => { if (timer !== undefined) window.clearTimeout(timer) }
  }, [webviewReady, isDesktop])

  useEffect(() => {
    const ready = (): void => setIsDesktop(true)
    window.addEventListener('dsh-desktop-ready', ready)
    if (desktopAvailable()) setIsDesktop(true)
    return () => window.removeEventListener('dsh-desktop-ready', ready)
  }, [])

  useEffect(() => {
    let cancelled = false
    const refresh = (): void => {
      void api.browserBridgeStatus().then(({ connected }) => {
        if (!cancelled) setBridgeConnected(connected)
      }).catch(() => { if (!cancelled) setBridgeConnected(false) })
    }
    refresh()
    const timer = window.setInterval(refresh, 5_000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [])

  // Mount the real-browser <webview> once (Electron desktop only). Navigation
  // is driven imperatively through webviewRef; the element is never remounted.
  useEffect(() => {
    if (!webviewReady || containerRef.current === null) return
    if (containerRef.current.querySelector('webview') !== null) return
    const wv = document.createElement('webview') as unknown as WebviewTag
    // NO allowpopups: window.open / target=_blank must fire new-window (which
    // we catch below and open in a sidebar tab) instead of popping a real
    // BrowserWindow outside the sidebar.
    // Persist: partition keeps cookies/login across reloads and restarts.
    wv.setAttribute('partition', 'persist:dsh-browser')
    wv.setAttribute('useragent', WEBVIEW_UA)
    // Pin the <webview> to the container's four edges so it always fills the
    // sidebar regardless of how the flex chain resolves. <webview> is a
    // replaced custom element and `height:100%` on it is unreliable; absolute
    // positioning against the relative container is the bullet-proof pattern.
    wv.style.position = 'absolute'
    wv.style.top = '0'
    wv.style.left = '0'
    wv.style.right = '0'
    wv.style.bottom = '0'
    wv.style.border = '0'
    wv.style.margin = '0'
    const onNavigate = (): void => {
      const current = wv.getURL()
      if (current) {
        setUrl(current); setInput(current); persist(current)
        applyZoomForHost(current)
      }
      reportWebContentsId()
    }
    // Ctrl+wheel inside the guest is Chromium's native zoom; sync state +
    // persistence from the webview's zoom-changed event so the address-bar
    // controls always reflect the real factor.
    const onZoomChanged = (arg?: unknown): void => {
      let factor: number | undefined
      if (typeof arg === 'number') factor = arg
      else if (arg !== null && typeof arg === 'object' && 'zoomFactor' in (arg as Record<string, unknown>)) {
        const v = (arg as Record<string, unknown>).zoomFactor
        if (typeof v === 'number') factor = v
      }
      if (typeof factor !== 'number' || !Number.isFinite(factor)) return
      const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, factor))
      setZoom(clamped)
      persistZoomForHost(clamped)
    }
    const onAttach = (): void => { reportWebContentsId() }
    // Report the guest webContentsId to the host so the webview_* agent
    // tools can read/operate THIS tab. Re-reported on attach and on every
    // navigation so session switches stay in sync. Non-desktop (web) builds
    // have no getWebContentsId — guarded.
    const reportWebContentsId = (): void => {
      const wcid = (wv as unknown as { getWebContentsId?: () => number }).getWebContentsId?.()
      if (typeof wcid !== 'number' || wcid <= 0) return
      const sid = store.getSnapshot().sessionId
      if (sid !== undefined) {
        void api.browserRegisterWebContents(sid, wcid)
          .catch(err => console.warn('[dsh-better-sidebar] register webContents failed:', err instanceof Error ? err.message : String(err)))
      } else {
        console.warn('[dsh-better-sidebar] webview attached but no active sessionId yet; will re-report on next navigation')
      }
    }
    // Ctrl+wheel inside the guest is delivered by the zoom preload via
    // ipc-message (guest wheel events never bubble to the parent page).
    const onIpc = (event: { channel?: string; args?: unknown[] }): void => {
      if (event.channel === 'zoom-wheel') {
        const delta = event.args?.[0]
        if (typeof delta === 'number' && Number.isFinite(delta)) zoomWheel(delta)
      }
    }
    wv.addEventListener('did-attach', onAttach)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    wv.addEventListener('zoom-changed', onZoomChanged as EventListener)
    wv.addEventListener('ipc-message', onIpc as EventListener)
    // Guest-initiated new windows (window.open / target=_blank) → open in a
    // sidebar tab, not a separate BrowserWindow. The webview's default
    // behavior (with allowpopups omitted) is to fire this event; we prevent
    // the default to stop Electron from popping an OS-level window.
    const onNewWindow = (event: Event): void => {
      const detail = (event as { url?: unknown; frameName?: unknown }).url
      if (typeof detail !== 'string') return
      event.preventDefault()
      const sid = store.getSnapshot().sessionId
      if (sid === undefined) return
      // openInNewTab is defined in component scope; fall through to the
      // sidebar's existing tab system (which may dedupe by id for same URL).
      openInNewTab(detail)
    }
    wv.addEventListener('new-window', onNewWindow as EventListener)
    // Preload must be in place before the guest's first navigation; write it
    // into the session workspace first (async), then attach + navigate.
    let cancelled = false
    const bootstrap = async (): Promise<void> => {
      try {
        const sid = store.getSnapshot().sessionId
        if (sid !== undefined) {
          const { cwd } = await api.sessionCwd({ sessionId: sid })
          const preloadAbs = `${cwd}/${ZOOM_PRELOAD_FILENAME}`.replace(/\\/g, '/')
          await api.fsWrite({ sessionId: sid }, preloadAbs, ZOOM_PRELOAD_JS)
          wv.setAttribute('preload', `file:///${preloadAbs}`)
        }
      } catch {
        // Zoom wheel degrades gracefully (buttons still work) when the
        // workspace is unwritable or the session is not ready.
      }
      if (cancelled) return
      if (containerRef.current === null || containerRef.current.querySelector('webview') !== null) return
      containerRef.current.appendChild(wv)
      // Set src AFTER append so the guest process actually picks it up.
      if (url !== undefined) {
        wv.setAttribute('src', url)
        wv.src = url
        applyZoomForHost(url)
      }
      webviewRef.current = wv
    }
    void bootstrap()
    return () => {
      cancelled = true
      wv.removeEventListener('did-attach', onAttach)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
      wv.removeEventListener('zoom-changed', onZoomChanged as EventListener)
      wv.removeEventListener('ipc-message', onIpc as EventListener)
      wv.removeEventListener('new-window', onNewWindow as EventListener)
      webviewRef.current = null
      wv.remove()
    }
    // Mount once; navigation driven imperatively. eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webviewReady])

  // Probe every navigation (address bar, history, restored path): when the
  // target forbids embedding, show the reason + open-in-browser instead of
  // the browser's cryptic "refused to connect" blank frame. A failed probe
  // (unreachable) keeps the plain iframe. (Non-webview fallback only.)
  useEffect(() => {
    if (url === undefined) return
    let cancelled = false
    setEmbedBlocked(null)
    setForceEmbed(false)
    void api.browserProbe(url).then((probe) => {
      if (!cancelled && embeddabilityOf(probe) === 'blocked') setEmbedBlocked(url)
    }).catch(() => { /* unreachable: keep the plain iframe */ })
    return () => { cancelled = true }
  }, [url])

  const persist = (nextUrl: string): void => {
    let host = nextUrl
    try { host = new URL(nextUrl).hostname } catch { /* keep the URL as title */ }
    store.reduce(state => patchTab(state, tab.id, { path: nextUrl, title: host }))
  }

  const navigateTo = (raw: string): void => {
    const result = normalizeBrowserUrl(raw, window.location.origin)
    if (result.kind === 'ok') {
      const next = result.url
      setUrl(next)
      setInput(next)
      setMessage(null)
      // Push onto the stack, dropping any stale forward entries.
      setHistory(previous => [...previous.slice(0, cursor + 1), next])
      setCursor(previous => previous + 1)
      setReloadKey(key => key + 1)
      persist(next)
      if (webviewReady && webviewRef.current !== null) {
        // Real in-app browser: drive the <webview> directly.
        webviewRef.current.src = next
      } else if (isDesktop) {
        const desktop = desktopInvoke<void>('open_browser_panel', { url: next })
        void desktop?.then(() => setMessage(t('browserDesktopOpened')))
          .catch(error => setMessage(String(error)))
      }
      return
    }
    setMessage(result.kind === 'invalid'
      ? t('browserInvalid')
      : result.reason === 'scheme' ? t('browserBlockedScheme')
      : t('browserBlockedLoopback'))
  }

  const goBack = (): void => {
    if (webviewReady && webviewRef.current !== null) { webviewRef.current.goBack(); return }
    if (cursor <= 0) return
    const next = history[cursor - 1]!
    setCursor(cursor - 1)
    setUrl(next)
    setInput(next)
    setReloadKey(key => key + 1)
  }

  const goForward = (): void => {
    if (webviewReady && webviewRef.current !== null) { webviewRef.current.goForward(); return }
    if (cursor >= history.length - 1) return
    const next = history[cursor + 1]!
    setCursor(cursor + 1)
    setUrl(next)
    setInput(next)
    setReloadKey(key => key + 1)
  }

  const reload = (): void => {
    if (webviewReady && webviewRef.current !== null) { webviewRef.current.reload(); return }
    setReloadKey(key => key + 1)
  }

  const openInChrome = (target: string): void => {
    setMessage(null)
    const desktop = desktopInvoke<void>('open_browser_panel', { url: target })
    if (desktop !== undefined) {
      void desktop.then(() => setMessage(t('browserDesktopOpened')))
        .catch(error => setMessage(String(error)))
      return
    }
    void api.browserBridgeNavigate(target).then(() => {
      setBridgeConnected(true)
      setMessage(t('browserBridgeConnected'))
    }).catch(() => {
      setBridgeConnected(false)
      setMessage(t('browserBridgeUnavailable'))
    })
  }

  return (
    <div className={css.browser}>
      <div className={css.browserBar}>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('browserBack')}
          title={t('browserBack')}
          disabled={webviewReady ? false : cursor <= 0}
          onClick={goBack}
        >
          <IconChevronLeftOutline14 />
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('browserForward')}
          title={t('browserForward')}
          disabled={webviewReady ? false : cursor >= history.length - 1}
          onClick={goForward}
        >
          <IconChevronRightOutline14 />
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('refresh')}
          title={t('refresh')}
          onClick={reload}
        >
          <IconRefreshOutline14 />
        </button>
        <input
          className={css.browserInput}
          value={input}
          placeholder={t('browserPlaceholder')}
          spellCheck={false}
          onChange={event => { setInput(event.target.value) }}
          onKeyDown={event => {
            if (event.key === 'Enter') navigateTo(input)
          }}
        />
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('browserGo')}
          title={t('browserGo')}
          onClick={() => { navigateTo(input) }}
        >
          <IconLinkOutline14 />
        </button>
        {webviewReady && (
          <span className={css.browserZoom}>
            <button
              type="button"
              className={css.iconButton}
              aria-label="缩小"
              title={`缩小（最低 ${Math.round(ZOOM_MIN * 100)}%）`}
              onClick={() => { applyZoom(zoom - ZOOM_STEP) }}
            >
              −
            </button>
            <button
              type="button"
              className={css.browserZoomValue}
              title="点击重置为 100%"
              onClick={() => { applyZoom(1) }}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className={css.iconButton}
              aria-label="放大"
              title={`放大（最高 ${Math.round(ZOOM_MAX * 100)}%）`}
              onClick={() => { applyZoom(zoom + ZOOM_STEP) }}
            >
              +
            </button>
          </span>
        )}
        <button
          type="button"
          className={css.iconButton}
          aria-label={isDesktop || bridgeConnected ? t('browserBridgeOpen') : t('browserBridgeUnavailable')}
          title={isDesktop || bridgeConnected ? t('browserBridgeOpen') : t('browserBridgeUnavailable')}
          disabled={url === undefined || (!isDesktop && !bridgeConnected)}
          onClick={() => { if (url !== undefined) openInChrome(url) }}
        >
          <IconGlobeOutline14 size={15} />
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={isCurrentBookmarked ? '移除书签' : '添加书签'}
          title={isCurrentBookmarked ? '移除书签' : '添加书签'}
          disabled={currentUrl === ''}
          onClick={toggleBookmark}
        >
          {isCurrentBookmarked ? '★' : '☆'}
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label="书签列表"
          title="书签列表"
          onClick={() => { setBookmarksOpen(open => !open) }}
        >
          📚
        </button>
        <button
          type="button"
          className={css.iconButton}
          aria-label={t('browserOpenExternal')}
          title={t('browserOpenExternal')}
          disabled={url === undefined}
          onClick={() => {
            if (url !== undefined) window.open(url, '_blank', 'noopener')
          }}
        >
          <IconRightUpOutline16 size={15} />
        </button>
      </div>
      {message !== null && <div className={css.browserMessage}>{message}</div>}
      {!webviewReady && (
        <SandboxStatusBar
          sandboxed={!noSandbox}
          local={localUnlock}
          dangerCopy={t('browserNoSandboxWarning')}
          onUnlock={() => { setLocalUnlock(true) }}
          onRestore={() => { setLocalUnlock(false) }}
        />
      )}
      {webviewReady ? (
        <div className={css.browserWebview} ref={containerRef}>
          {bookmarksOpen && (
            <div className={css.bookmarksOverlay} role="dialog" aria-label="书签">
              <div className={css.bookmarksHeader}>
                <span>书签</span>
                <button
                  type="button"
                  className={css.iconButton}
                  aria-label="关闭"
                  onClick={() => { setBookmarksOpen(false) }}
                >×</button>
              </div>
              <ul className={css.bookmarksList} key={bookmarksVersion}>
                {bookmarksRead().length === 0
                  ? <li className={css.bookmarksEmpty}>暂无书签，点 ☆ 收藏当前页</li>
                  : bookmarksRead().map((b) => (
                    <li key={b.url} className={css.bookmarksItem}>
                      <button
                        type="button"
                        className={css.bookmarksOpenBtn}
                        onClick={() => { navigateTo(b.url); setBookmarksOpen(false) }}
                      >
                        <span className={css.bookmarksTitle}>{b.title}</span>
                        <span className={css.bookmarksUrl}>{b.url}</span>
                      </button>
                      <button
                        type="button"
                        className={css.iconButton}
                        aria-label="删除书签"
                        title="删除书签"
                        onClick={() => {
                          const list = bookmarksRead().filter(x => x.url !== b.url)
                          bookmarksWrite(list)
                          setBookmarksVersion(v => v + 1)
                        }}
                      >×</button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      ) : url === undefined ? (
        <div className={css.browserStart}>{t('browserStart')}</div>
      ) : isDesktop && !webviewTimedOut ? (
        <div className={css.browserStart}>正在启动内嵌浏览器…</div>
      ) : isDesktop && webviewTimedOut ? (
        <div className={css.browserStart}>
          内嵌浏览器未启用：请在 dsh-better-sidebar 插件目录运行{' '}
          <code>scripts\patch-desktop\run-patch.bat</code>（DSH Desktop 版需要该补丁，
          重启后生效）。Web 版无此功能，可点右上角「打开外部浏览器」。
        </div>
      ) : embedBlocked !== null && !forceEmbed ? (
        <BrowserEmbedBlocked
          url={embedBlocked}
          bridgeConnected={isDesktop || bridgeConnected}
          onOpenInChrome={() => { openInChrome(embedBlocked) }}
          onOpenInBrowser={() => { window.open(embedBlocked, '_blank', 'noopener') }}
          onLoadAnyway={() => { setForceEmbed(true) }}
        />
      ) : (
        <iframe
          key={`${reloadKey}:${noSandbox ? 'ns' : 'sb'}`}
          className={css.browserFrame}
          src={url}
          sandbox={noSandbox ? undefined : BROWSER_IFRAME_SANDBOX}
          referrerPolicy="no-referrer"
          allow=""
          title={url}
        />
      )}
    </div>
  )
}

/**
 * The embed-refusal panel: shown when the probed site forbids being
 * displayed inside other pages (X-Frame-Options / frame-ancestors) — the
 * iframe would only show the browser's "refused to connect" blank. Explains
 * the reason and offers the real-browser open plus a load-anyway escape.
 * Exported so the copy and the actions are testable without a DOM.
 */
export function BrowserEmbedBlocked(props: {
  url: string
  bridgeConnected: boolean
  onOpenInChrome: () => void
  onOpenInBrowser: () => void
  onLoadAnyway: () => void
}) {
  const { url, bridgeConnected, onOpenInChrome, onOpenInBrowser, onLoadAnyway } = props
  let host = url
  try { host = new URL(url).hostname } catch { /* keep the raw URL */ }
  return (
    <div className={css.browserBlocked}>
      <div className={css.browserBlockedTitle}>{t('browserEmbedBlocked', { host })}</div>
      <div className={css.browserBlockedDesc}>{t('browserEmbedBlockedDesc')}</div>
      <div className={css.browserBlockedActions}>
        {bridgeConnected && (
          <button type="button" className={css.browserBlockedButton} onClick={onOpenInChrome}>
            {t('browserBridgeOpen')}
          </button>
        )}
        <button type="button" className={css.browserBlockedButton} onClick={onOpenInBrowser}>
          {t('browserOpenExternal')}
        </button>
        <button type="button" className={css.browserBlockedButton} onClick={onLoadAnyway}>
          {t('browserEmbedAnyway')}
        </button>
      </div>
    </div>
  )
}
