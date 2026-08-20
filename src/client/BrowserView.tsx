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
import { patchTab } from './state.ts'
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
    wv.setAttribute('allowpopups', 'true')
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
      if (current) { setUrl(current); setInput(current); persist(current) }
      reportWebContentsId()
    }
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
    const onAttach = (): void => { reportWebContentsId() }
    wv.addEventListener('did-attach', onAttach)
    wv.addEventListener('did-navigate', onNavigate)
    wv.addEventListener('did-navigate-in-page', onNavigate)
    containerRef.current.appendChild(wv)
    // Set src AFTER append so the guest process actually picks it up. Setting
    // it on a detached webview before append sometimes leaves the guest on
    // about:blank.
    if (url !== undefined) {
      wv.setAttribute('src', url)
      wv.src = url
    }
    webviewRef.current = wv
    return () => {
      wv.removeEventListener('did-attach', onAttach)
      wv.removeEventListener('did-navigate', onNavigate)
      wv.removeEventListener('did-navigate-in-page', onNavigate)
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
        <div className={css.browserWebview} ref={containerRef} />
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
