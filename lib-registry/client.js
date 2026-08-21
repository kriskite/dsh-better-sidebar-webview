window.__ModuleLoader__.load({
  id: "dsh-external/dsh-better-sidebar",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react21 = require("react");
var import_client = require("react-dom/client");

// src/prefs-shared.ts
var WIDTH_PERCENT_MIN = 20;
var WIDTH_PERCENT_MAX = 60;
var WIDTH_PERCENT_DEFAULT = 35;
var TERMINAL_FONT_SIZE_MIN = 9;
var TERMINAL_FONT_SIZE_MAX = 32;
var TERMINAL_FONT_SIZE_DEFAULT = 13;
var TITLE_BAR_STRIP_MIN = 0;
var TITLE_BAR_STRIP_MAX = 120;
var TITLE_BAR_STRIP_DEFAULT = 40;
var SIDEBAR_PREFS_DEFAULTS = {
  openByDefault: false,
  defaultWidthPercent: WIDTH_PERCENT_DEFAULT,
  autoOpenSubagent: true,
  autoOpenJobs: true,
  agentTerminalTools: false,
  bottomPanelAutoTerminal: true,
  terminalFontFamily: "",
  terminalFontSize: TERMINAL_FONT_SIZE_DEFAULT,
  interceptOpenPath: true,
  editorExplorer: true,
  titleBarCompat: false,
  titleBarStripPx: TITLE_BAR_STRIP_DEFAULT,
  htmlViewerNoSandbox: false,
  htmlViewerDefaultUnsafe: false,
  browserNoSandbox: false,
  browserInterceptLinks: true,
  browserInterceptHttp: true,
  browserInterceptHttps: false,
  tabsEnabled: {},
  viewersEnabled: {},
  pluginSettings: {}
};
function clampWidthPercent(value) {
  return Math.min(WIDTH_PERCENT_MAX, Math.max(WIDTH_PERCENT_MIN, Math.round(value)));
}
function clampTerminalFontSize(value) {
  return Math.min(TERMINAL_FONT_SIZE_MAX, Math.max(TERMINAL_FONT_SIZE_MIN, Math.round(value)));
}
function clampTitleBarStrip(value) {
  return Math.min(TITLE_BAR_STRIP_MAX, Math.max(TITLE_BAR_STRIP_MIN, Math.round(value)));
}

// src/client/breakpoints.ts
var import_react = require("react");
var NARROW_MAX_WIDTH = 768;
function isNarrowWidth(width) {
  return width < NARROW_MAX_WIDTH;
}
function useNarrowViewport() {
  const [narrow, setNarrow] = (0, import_react.useState)(
    () => typeof window !== "undefined" && isNarrowWidth(window.innerWidth)
  );
  (0, import_react.useEffect)(() => {
    if (typeof window === "undefined") return;
    let frame = null;
    const measure = () => {
      frame = null;
      setNarrow(isNarrowWidth(window.innerWidth));
    };
    const onResize = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);
  return narrow;
}

// src/client/state.ts
var PANEL_MIN = 280;
var PANEL_MAX = 640;
var PANEL_DEFAULT = 400;
var BOTTOM_MIN = 120;
var BOTTOM_DEFAULT = 220;
var nextIdCounter = 0;
function uid(prefix) {
  nextIdCounter += 1;
  return `${prefix}:${nextIdCounter}`;
}
function mintTabId() {
  return uid("tab");
}
function maxCounterId(parsed) {
  let max = 0;
  const consider = (id) => {
    if (typeof id !== "string") return;
    const match = /^(?:pane|tab|split):(\d+)$/.exec(id);
    if (match !== null) max = Math.max(max, Number(match[1]));
  };
  const walk = (node) => {
    if (node === null || typeof node !== "object") return;
    const record = node;
    consider(record.id);
    if (Array.isArray(record.tabs)) {
      for (const tab of record.tabs) {
        if (tab !== null && typeof tab === "object") consider(tab.id);
      }
    }
    if (Array.isArray(record.children)) {
      for (const child of record.children) walk(child);
    }
  };
  walk(parsed?.splits);
  walk(parsed?.bottomSplits);
  return max;
}
function makeDefaultState(width = PANEL_DEFAULT, panelOpen = true, seed = "editor-home") {
  const leaf = { kind: "leaf", id: uid("pane"), tabs: [], active: null };
  if (seed === "editor-home") {
    leaf.tabs = [{ id: uid("tab"), type: "editor", title: "Files", meta: { treeOpen: true } }];
    leaf.active = leaf.tabs[0].id;
  }
  const bottomLeaf = { kind: "leaf", id: uid("pane"), tabs: [], active: null };
  return {
    panelOpen,
    panelSide: "right",
    width,
    activePane: leaf.id,
    nextTerminal: 1,
    nextBrowser: 1,
    expanded: [],
    splits: leaf,
    bottomOpen: false,
    bottomHeight: BOTTOM_DEFAULT,
    bottomOpenedOnce: false,
    bottomSplits: bottomLeaf
  };
}
function treeHasId(node, id) {
  if (node.id === id) return true;
  if (node.kind === "split") return node.children.some((child) => treeHasId(child, id));
  return false;
}
function treeOf(state, id) {
  return treeHasId(state.bottomSplits, id) ? "bottomSplits" : "splits";
}
function mapLeaf(node, paneId, visit) {
  if (node.kind === "leaf") {
    if (node.id === paneId) {
      const copy = { ...node, tabs: [...node.tabs] };
      visit(copy);
      return copy;
    }
    return node;
  }
  const split = node;
  return {
    ...split,
    sizes: [...split.sizes],
    children: split.children.map((child) => mapLeaf(child, paneId, visit))
  };
}
function firstLeaf(node) {
  if (node.kind === "leaf") return node;
  return firstLeaf(node.children[0]);
}
function clearAllTabs(node) {
  if (node.kind === "leaf") return { ...node, tabs: [], active: null };
  return { ...node, children: node.children.map(clearAllTabs) };
}
function migrateBottomTabs(state) {
  const bottomTabs = allLeaves(state.bottomSplits).flatMap((leaf) => leaf.tabs);
  const activeInBottom = state.activePane !== null && treeHasId(state.bottomSplits, state.activePane);
  if (bottomTabs.length === 0 && !state.bottomOpen && !activeInBottom) return state;
  const target = firstLeaf(state.splits);
  return {
    ...state,
    activePane: target.id,
    bottomOpen: false,
    splits: bottomTabs.length > 0 ? mapLeaf(state.splits, target.id, (leaf) => {
      leaf.tabs = [...leaf.tabs, ...bottomTabs];
    }) : state.splits,
    bottomSplits: bottomTabs.length > 0 ? clearAllTabs(state.bottomSplits) : state.bottomSplits
  };
}
function leafWithTab(node, tabId) {
  if (node.kind === "leaf") {
    return node.tabs.some((tab) => tab.id === tabId) ? node : void 0;
  }
  for (const child of node.children) {
    const found = leafWithTab(child, tabId);
    if (found !== void 0) return found;
  }
  return void 0;
}
function allLeaves(node) {
  if (node.kind === "leaf") return [node];
  return node.children.flatMap(allLeaves);
}
function tabOpenIn(state, tabId) {
  return allLeaves(state.splits).some((leaf) => leaf.tabs.some((tab) => tab.id === tabId)) || allLeaves(state.bottomSplits).some((leaf) => leaf.tabs.some((tab) => tab.id === tabId));
}
function insertLeafAt(node, paneId, dir, tab, front) {
  const fresh = { kind: "leaf", id: uid("pane"), tabs: [tab], active: tab.id };
  const leafId = fresh.id;
  const next = mapLeaf(node, paneId, (leaf) => {
    const target = { ...leaf };
    const split = {
      kind: "split",
      id: uid("split"),
      dir,
      sizes: [0.5, 0.5],
      children: front ? [fresh, target] : [target, fresh]
    };
    Object.assign(leaf, split);
  });
  return { node: next, leafId };
}
function moveTabToEdge(state, fromPane, tabId, toPane, zone) {
  if (fromPane === toPane && zone === "center") {
    return moveTab(state, fromPane, tabId, toPane, -1);
  }
  const key = treeOf(state, fromPane);
  const toKey = treeOf(state, toPane);
  if (key !== toKey) {
    const source2 = leafWithTab(state[key], tabId);
    if (source2 === void 0) return state;
    const tab2 = source2.tabs.find((candidate) => candidate.id === tabId);
    let emptied2 = false;
    let sourceNode = mapLeaf(state[key], source2.id, (leaf) => {
      leaf.tabs = leaf.tabs.filter((candidate) => candidate.id !== tabId);
      if (leaf.active === tabId) leaf.active = leaf.tabs[leaf.tabs.length - 1]?.id ?? null;
      if (leaf.tabs.length === 0) emptied2 = true;
    });
    if (emptied2) sourceNode = removeLeafAt(sourceNode, source2.id);
    let targetNode = state[toKey];
    let activePane;
    if (zone === "center") {
      targetNode = mapLeaf(targetNode, toPane, (leaf) => {
        leaf.tabs = [...leaf.tabs, tab2];
        leaf.active = tab2.id;
      });
      activePane = toPane;
    } else {
      const dir2 = zone === "left" || zone === "right" ? "row" : "col";
      const result2 = insertLeafAt(targetNode, toPane, dir2, tab2, zone === "left" || zone === "up");
      targetNode = result2.node;
      activePane = result2.leafId;
    }
    return { ...state, [key]: sourceNode, [toKey]: targetNode, activePane };
  }
  const node = state[key];
  const source = leafWithTab(node, tabId);
  if (source === void 0) return state;
  const tab = source.tabs.find((candidate) => candidate.id === tabId);
  let emptied = false;
  let splits = mapLeaf(node, source.id, (leaf) => {
    leaf.tabs = leaf.tabs.filter((candidate) => candidate.id !== tabId);
    if (leaf.active === tabId) leaf.active = leaf.tabs[leaf.tabs.length - 1]?.id ?? null;
    if (leaf.tabs.length === 0) emptied = true;
  });
  if (emptied) splits = removeLeafAt(splits, source.id);
  if (zone === "center") {
    splits = mapLeaf(splits, toPane, (leaf) => {
      leaf.tabs = [...leaf.tabs, tab];
      leaf.active = tab.id;
    });
    return { ...state, [key]: splits, activePane: toPane };
  }
  const dir = zone === "left" || zone === "right" ? "row" : "col";
  const result = insertLeafAt(splits, toPane, dir, tab, zone === "left" || zone === "up");
  return { ...state, [key]: result.node, activePane: result.leafId };
}
function removeLeafAt(node, paneId) {
  if (node.kind === "leaf") return node.id === paneId ? { ...node, tabs: [], active: null } : node;
  const children = node.children.filter((child) => !(child.kind === "leaf" && child.id === paneId));
  if (children.length === node.children.length) {
    return {
      ...node,
      sizes: [...node.sizes],
      children: node.children.map((child) => removeLeafAt(child, paneId))
    };
  }
  if (children.length === 1) return children[0];
  return { ...node, sizes: [...node.sizes], children };
}
function closeTab(state, paneId, tabId) {
  const key = treeOf(state, paneId);
  let emptied = false;
  const splits = mapLeaf(state[key], paneId, (leaf) => {
    leaf.tabs = leaf.tabs.filter((tab) => tab.id !== tabId);
    if (leaf.active === tabId) leaf.active = leaf.tabs[leaf.tabs.length - 1]?.id ?? null;
    if (leaf.tabs.length === 0) emptied = true;
  });
  return { ...state, [key]: emptied ? removeLeafAt(splits, paneId) : splits };
}
function activateTab(state, paneId, tabId) {
  const key = treeOf(state, paneId);
  return {
    ...state,
    activePane: paneId,
    [key]: mapLeaf(state[key], paneId, (leaf) => {
      if (leaf.tabs.some((tab) => tab.id === tabId)) leaf.active = tabId;
    })
  };
}
function patchTab(state, tabId, patch) {
  let changed = false;
  const walk = (node) => {
    if (node.kind === "leaf") {
      const tabs = node.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        changed = true;
        return {
          ...tab,
          ...patch.title !== void 0 ? { title: patch.title } : {},
          ...patch.path !== void 0 ? { path: patch.path } : {},
          ...patch.meta !== void 0 ? { meta: patch.meta } : {}
        };
      });
      return tabs === node.tabs ? node : { ...node, tabs };
    }
    const children = node.children.map(walk);
    return children === node.children ? node : { ...node, children };
  };
  const splits = walk(state.splits);
  const bottomSplits = walk(state.bottomSplits);
  return changed ? { ...state, splits, bottomSplits } : state;
}
function openTabInActivePane(state, tab) {
  let targetId = state.activePane ?? firstLeaf(state.splits).id;
  if (!allLeaves(state[treeOf(state, targetId)]).some((leaf) => leaf.id === targetId)) {
    targetId = firstLeaf(state.splits).id;
  }
  const targetKey = treeOf(state, targetId);
  for (const leaf of allLeaves(state.splits).concat(allLeaves(state.bottomSplits))) {
    const existing = leaf.tabs.find((candidate) => candidate.id === tab.id);
    if (existing !== void 0) return activateTab(state, leaf.id, existing.id);
  }
  return {
    ...state,
    activePane: targetId,
    [targetKey]: mapLeaf(state[targetKey], targetId, (leaf) => {
      leaf.tabs = [...leaf.tabs, tab];
      leaf.active = tab.id;
    })
  };
}
function moveTab(state, fromPane, tabId, toPane, index = -1) {
  const fromKey = treeOf(state, fromPane);
  const toKey = treeOf(state, toPane);
  if (fromKey !== toKey) {
    let moved2;
    let emptied2 = false;
    const source = mapLeaf(state[fromKey], fromPane, (leaf) => {
      const found = leaf.tabs.find((tab) => tab.id === tabId);
      if (found === void 0) return;
      moved2 = found;
      leaf.tabs = leaf.tabs.filter((tab) => tab.id !== tabId);
      if (leaf.active === tabId) leaf.active = leaf.tabs[leaf.tabs.length - 1]?.id ?? null;
      if (leaf.tabs.length === 0) emptied2 = true;
    });
    if (moved2 === void 0) return state;
    const target = mapLeaf(state[toKey], toPane, (leaf) => {
      const insertAt = index >= 0 && index <= leaf.tabs.length ? index : leaf.tabs.length;
      leaf.tabs = [...leaf.tabs.slice(0, insertAt), moved2, ...leaf.tabs.slice(insertAt)];
      leaf.active = moved2.id;
    });
    return {
      ...state,
      [fromKey]: emptied2 ? removeLeafAt(source, fromPane) : source,
      [toKey]: target,
      activePane: toPane
    };
  }
  let moved;
  let emptied = false;
  let splits = mapLeaf(state[fromKey], fromPane, (leaf) => {
    const found = leaf.tabs.find((tab) => tab.id === tabId);
    if (found === void 0) return;
    moved = found;
    leaf.tabs = leaf.tabs.filter((tab) => tab.id !== tabId);
    if (leaf.active === tabId) leaf.active = leaf.tabs[leaf.tabs.length - 1]?.id ?? null;
    if (leaf.tabs.length === 0) emptied = true;
  });
  if (moved === void 0) return state;
  if (emptied) splits = removeLeafAt(splits, fromPane);
  splits = mapLeaf(splits, toPane, (leaf) => {
    const insertAt = index >= 0 && index <= leaf.tabs.length ? index : leaf.tabs.length;
    leaf.tabs = [...leaf.tabs.slice(0, insertAt), moved, ...leaf.tabs.slice(insertAt)];
    leaf.active = moved.id;
  });
  return { ...state, [fromKey]: splits, activePane: toPane };
}
function openDiffTab(state, sourcePaneId, tab) {
  const existingLeaf = leafWithTab(state.splits, tab.id);
  if (existingLeaf !== void 0) return activateTab(state, existingLeaf.id, tab.id);
  const diffLeaf = allLeaves(state.splits).find((leaf) => leaf.tabs.some((candidate) => candidate.type === "diff"));
  if (diffLeaf !== void 0) {
    return {
      ...state,
      activePane: diffLeaf.id,
      splits: mapLeaf(state.splits, diffLeaf.id, (leaf) => {
        leaf.tabs = [...leaf.tabs, tab];
        leaf.active = tab.id;
      })
    };
  }
  if (!allLeaves(state.splits).some((leaf) => leaf.id === sourcePaneId)) {
    return openTabInActivePane(state, tab);
  }
  const result = insertLeafAt(state.splits, sourcePaneId, "col", tab, false);
  return { ...state, splits: result.node, activePane: result.leafId };
}
function togglePanel(state) {
  return { ...state, panelOpen: !state.panelOpen };
}
function swapPanelSide(state) {
  return { ...state, panelSide: state.panelSide === "right" ? "left" : "right" };
}
function toggleBottomPanel(state) {
  return { ...state, bottomOpen: !state.bottomOpen };
}
function setWidth(state, width) {
  const max = typeof window !== "undefined" ? Math.max(PANEL_MIN, window.innerWidth) : PANEL_MAX;
  return { ...state, width: Math.min(max, Math.max(PANEL_MIN, Math.round(width))) };
}
function setBottomHeight(state, height) {
  const viewport = typeof window !== "undefined" ? window.innerHeight : Infinity;
  const max = Math.max(BOTTOM_MIN, viewport - PANEL_MIN);
  return { ...state, bottomHeight: Math.min(max, Math.max(BOTTOM_MIN, Math.round(height))) };
}
function toggleExpanded(state, path) {
  const expanded = state.expanded.includes(path) ? state.expanded.filter((item) => item !== path) : [...state.expanded, path];
  return { ...state, expanded };
}
function resizeSplit(node, splitId, index, delta) {
  if (node.kind === "leaf") return node;
  if (node.id === splitId) {
    const sizes = [...node.sizes];
    const left = Math.min(0.92, Math.max(0.08, sizes[index] + delta));
    const right = Math.min(0.92, Math.max(0.08, sizes[index + 1] - delta));
    sizes[index] = left;
    sizes[index + 1] = right;
    return { ...node, sizes };
  }
  return {
    ...node,
    sizes: [...node.sizes],
    children: node.children.map((child) => resizeSplit(child, splitId, index, delta))
  };
}
function resizeSplitIn(state, splitId, index, delta) {
  const key = treeOf(state, splitId);
  return { ...state, [key]: resizeSplit(state[key], splitId, index, delta) };
}
var AGENT_TAB_PREFIX = "agent:";
function isAgentTabId(tabId) {
  return tabId.startsWith(AGENT_TAB_PREFIX);
}
function agentUuidOf(tabId) {
  return tabId.slice(AGENT_TAB_PREFIX.length);
}
function agentTabId(uuid) {
  return `${AGENT_TAB_PREFIX}${uuid}`;
}
function reconcileAgentTerminals(state, agentTerminals) {
  const existingTabs = allLeaves(state.splits).concat(allLeaves(state.bottomSplits)).flatMap((leaf) => leaf.tabs);
  const existingAgentTabs = existingTabs.filter((tab) => isAgentTabId(tab.id));
  const existingUuids = new Set(existingAgentTabs.map((tab) => agentUuidOf(tab.id)));
  const serverUuids = new Set(agentTerminals.map((t2) => t2.uuid));
  const toAdd = agentTerminals.filter((t2) => !existingUuids.has(t2.uuid));
  const toRemove = existingAgentTabs.filter((tab) => !serverUuids.has(agentUuidOf(tab.id)));
  if (toAdd.length === 0 && toRemove.length === 0) return state;
  let splits = state.splits;
  for (const tab of toRemove) {
    const leaf = leafWithTab(splits, tab.id);
    if (leaf !== void 0) {
      splits = closeTab({ ...state, splits }, leaf.id, tab.id).splits;
    }
  }
  let next = { ...state, splits };
  for (const terminal of toAdd) {
    const tab = {
      id: agentTabId(terminal.uuid),
      type: "terminal",
      title: terminal.title
    };
    next = openTabInActivePane(next, tab);
  }
  return next;
}
var STORAGE_PREFIX = "dsh-sidebar:v1";
function defaultWidthFor(viewport, percent) {
  return Math.min(viewport, Math.max(PANEL_MIN, Math.round(viewport * percent / 100)));
}
function loadState(sessionId, prefs) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${sessionId}`);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      nextIdCounter = maxCounterId(parsed);
      const sanitized = sanitizeState(parsed);
      if (sanitized !== void 0) return sanitized;
    }
  } catch {
  }
  const viewport = typeof window !== "undefined" ? window.innerWidth : void 0;
  const width = viewport === void 0 ? PANEL_DEFAULT : defaultWidthFor(viewport, prefs.defaultWidthPercent);
  const openByDefault = prefs.openByDefault && (viewport === void 0 || !isNarrowWidth(viewport));
  const seed = prefs.tabsEnabled["editor"] === false ? "none" : "editor-home";
  return makeDefaultState(width, openByDefault, seed);
}
function sanitizeState(parsed) {
  if (parsed === null || typeof parsed !== "object") return void 0;
  const record = parsed;
  if (typeof record.panelOpen !== "boolean") return void 0;
  if (typeof record.width !== "number" || !Number.isFinite(record.width)) return void 0;
  if (typeof record.nextTerminal !== "number" || !Number.isInteger(record.nextTerminal) || record.nextTerminal < 1) {
    return void 0;
  }
  const nextBrowser = typeof record.nextBrowser === "number" && Number.isInteger(record.nextBrowser) && record.nextBrowser >= 1 ? record.nextBrowser : 1;
  if (typeof record.activePane !== "string" && record.activePane !== null) return void 0;
  if (!Array.isArray(record.expanded) || record.expanded.some((item) => typeof item !== "string")) return void 0;
  const seen = /* @__PURE__ */ new Set();
  const reid = /* @__PURE__ */ new Map();
  const splits = sanitizeNode(record.splits, seen, reid);
  if (splits === void 0) return void 0;
  const bottomOpen = record.bottomOpen === true;
  const maxHeight = typeof window !== "undefined" ? window.innerHeight : Infinity;
  const bottomCap = Math.max(BOTTOM_MIN, maxHeight - PANEL_MIN);
  const rawHeight = typeof record.bottomHeight === "number" && Number.isFinite(record.bottomHeight) ? record.bottomHeight : BOTTOM_DEFAULT;
  const bottomHeight = Math.min(bottomCap, Math.max(BOTTOM_MIN, Math.round(rawHeight)));
  const bottomSplits = sanitizeNode(record.bottomSplits, seen, reid) ?? { kind: "leaf", id: uid("pane"), tabs: [], active: null };
  const maxWidth = typeof window !== "undefined" ? window.innerWidth : Infinity;
  return {
    panelOpen: record.panelOpen,
    // panelSide arrived after the v1 shape. Preserve every older layout on
    // the original right side unless it explicitly persisted "left".
    panelSide: record.panelSide === "left" ? "left" : "right",
    width: Math.max(PANEL_MIN, Math.min(record.width, maxWidth)),
    // A stale duplicate pane id may have been re-ided; follow the rename so
    // new tabs still land in the pane the user was using.
    activePane: typeof record.activePane === "string" ? reid.get(record.activePane) ?? record.activePane : null,
    nextTerminal: record.nextTerminal,
    nextBrowser,
    expanded: record.expanded,
    splits,
    bottomOpen,
    bottomHeight,
    // An older persisted state never expanded the bottom panel (the field
    // arrived later): defaulting to false gives it the first-expansion
    // auto-terminal exactly once after the upgrade.
    bottomOpenedOnce: record.bottomOpenedOnce === true,
    bottomSplits
  };
}
function uniqueNodeId(id, seen, reid) {
  if (!seen.has(id)) {
    seen.add(id);
    return id;
  }
  const prefix = /^split:\d+$/.test(id) ? "split" : "pane";
  const fresh = uid(prefix);
  seen.add(fresh);
  reid.set(id, fresh);
  return fresh;
}
function sanitizeNode(node, seen, reid) {
  if (node === null || typeof node !== "object") return void 0;
  const record = node;
  if (record.kind === "leaf") {
    if (typeof record.id !== "string" || !Array.isArray(record.tabs)) return void 0;
    const tabs = [];
    let droppedDiff = false;
    for (const tab of record.tabs) {
      if (tab === null || typeof tab !== "object") return void 0;
      const candidate = tab;
      if (typeof candidate.id !== "string" || typeof candidate.title !== "string") return void 0;
      if (candidate.type === "diff") {
        droppedDiff = true;
        continue;
      }
      if (typeof candidate.type !== "string") return void 0;
      if (candidate.type === "explorer") {
        const meta = candidate.meta !== null && typeof candidate.meta === "object" && !Array.isArray(candidate.meta) ? candidate.meta : void 0;
        tabs.push({
          id: candidate.id,
          type: "editor",
          title: "Files",
          meta: { treeOpen: true, ...meta }
        });
        continue;
      }
      tabs.push({
        id: candidate.id,
        type: candidate.type,
        title: candidate.title,
        ...typeof candidate.path === "string" ? { path: candidate.path } : {},
        ...candidate.meta !== void 0 ? { meta: candidate.meta } : {}
      });
    }
    const active = typeof record.active === "string" ? record.active : null;
    if (active !== null && !tabs.some((tab) => tab.id === active) && !droppedDiff) return void 0;
    return { kind: "leaf", id: uniqueNodeId(record.id, seen, reid), tabs, active: active !== null && tabs.some((tab) => tab.id === active) ? active : null };
  }
  if (record.kind === "split") {
    if (typeof record.id !== "string" || record.dir !== "row" && record.dir !== "col") return void 0;
    if (!Array.isArray(record.children) || !Array.isArray(record.sizes)) return void 0;
    const children = [];
    for (const child of record.children) {
      const clean = sanitizeNode(child, seen, reid);
      if (clean === void 0) return void 0;
      children.push(clean);
    }
    if (children.length < 2) return void 0;
    if (record.sizes.length !== children.length || record.sizes.some((size) => typeof size !== "number" || !Number.isFinite(size) || size <= 0)) {
      return void 0;
    }
    return { kind: "split", id: uniqueNodeId(record.id, seen, reid), dir: record.dir, sizes: record.sizes, children };
  }
  return void 0;
}
var SidebarStore = class {
  bySession = /* @__PURE__ */ new Map();
  snapshot = {
    sessionId: void 0,
    state: void 0,
    prefs: { ...SIDEBAR_PREFS_DEFAULTS }
  };
  listeners = /* @__PURE__ */ new Set();
  /** Per-session persist debounce timers (v0.12.0+: one per session, so a
   *  targeted open never cancels another session's pending write). */
  persistTimers = /* @__PURE__ */ new Map();
  /** User-facing side card prefs seeding brand-new session states (defaults until the settings RPC resolves). */
  prefs = { ...SIDEBAR_PREFS_DEFAULTS };
  /**
   * External disable (the dsh-web-ui family's aionui-panel provider choice):
   * while true the sidebar must not mount at all. Not part of the snapshot —
   * nothing renders on it; the mount gate and the intercept predicates read
   * it directly.
   */
  suspended = false;
  /**
   * Set the external-disable flag (from the settings route) and remember it
   * for the mount gate and the intercept predicates.
   */
  setSuspended(suspended) {
    this.suspended = suspended;
  }
  /** Whether the sidebar is externally disabled (aionui-panel chosen). */
  getSuspended() {
    return this.suspended;
  }
  /**
   * Replace the side card prefs (the settings RPC result / settings page
   * write). Notifies like any store change: the snapshot carries the prefs,
   * so consumers that gate on enable switches (the + menu, derived flows)
   * re-render with the new values immediately.
   */
  setPrefs(prefs) {
    this.prefs = { ...prefs };
    this.snapshot = { ...this.snapshot, prefs: this.prefs };
    this.notify();
  }
  /** The current side card prefs (seeds new sessions; persisted states win). */
  getPrefs() {
    return { ...this.prefs };
  }
  /** Select a session (or none); loads its persisted state. */
  setSession(sessionId) {
    if (this.snapshot.sessionId === sessionId) return;
    if (sessionId === void 0) {
      this.snapshot = { sessionId: void 0, state: void 0, prefs: this.prefs };
    } else {
      let state = this.bySession.get(sessionId);
      if (state === void 0) {
        state = loadState(sessionId, this.prefs);
        this.bySession.set(sessionId, state);
      } else {
        nextIdCounter = maxCounterId(state);
      }
      this.snapshot = { sessionId, state, prefs: this.prefs };
    }
    this.notify();
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  getSnapshot() {
    return this.snapshot;
  }
  /** Mutate the current session's state (no-op without a session). */
  update(mutator) {
    const sessionId = this.snapshot.sessionId;
    const state = this.snapshot.state;
    if (sessionId === void 0 || state === void 0) return;
    const draft = structuredClone(state);
    mutator(draft);
    this.bySession.set(sessionId, draft);
    this.snapshot = { sessionId, state: draft, prefs: this.prefs };
    this.schedulePersist(sessionId, draft);
    this.notify();
  }
  /**
   * Whether a tab still exists in its session's state. Views use this on
   * unmount to tell "the tab was closed" (release the terminal now) from
   * "the tree re-rendered / the conversation switched" (the tab is still
   * open — keep the terminal alive through the host's reconnect grace).
   * Checks the session's own map entry (the current snapshot may already
   * point at another session when a conversation switch unmounts the old
   * one's tabs).
   */
  tabOpen(sessionId, tabId) {
    const state = this.bySession.get(sessionId) ?? (this.snapshot.sessionId === sessionId ? this.snapshot.state : void 0);
    return state !== void 0 && tabOpenIn(state, tabId);
  }
  /** Apply a pure reducer (returns the next state). */
  reduce(reducer) {
    const sessionId = this.snapshot.sessionId;
    const state = this.snapshot.state;
    if (sessionId === void 0 || state === void 0) return;
    const next = reducer(state);
    if (next === state) return;
    this.bySession.set(sessionId, next);
    this.snapshot = { sessionId, state: next, prefs: this.prefs };
    this.schedulePersist(sessionId, next);
    this.notify();
  }
  /**
   * Apply a pure reducer to a TARGET session's state (not the active one),
   * loading it on demand and persisting the result — WITHOUT switching the
   * active snapshot or notifying (the UI must not follow along). Used by the
   * service's targeted `openTab(seed, scope)`: the open lands in the target
   * session's layout and is visible whenever the user switches to it.
   */
  reduceFor(sessionId, reducer) {
    const counterBefore = nextIdCounter;
    let state = this.bySession.get(sessionId);
    if (state === void 0) {
      state = loadState(sessionId, this.prefs);
      this.bySession.set(sessionId, state);
    } else {
      nextIdCounter = maxCounterId(state);
    }
    const next = reducer(state);
    nextIdCounter = Math.max(nextIdCounter, counterBefore);
    if (next === state) return;
    this.bySession.set(sessionId, next);
    this.schedulePersist(sessionId, next);
  }
  schedulePersist(sessionId, state) {
    const existing = this.persistTimers.get(sessionId);
    if (existing !== void 0) window.clearTimeout(existing);
    const timer = window.setTimeout(() => {
      this.persistTimers.delete(sessionId);
      try {
        localStorage.setItem(`${STORAGE_PREFIX}:${sessionId}`, JSON.stringify(state));
      } catch {
      }
    }, 200);
    this.persistTimers.set(sessionId, timer);
  }
  notify() {
    for (const listener of [...this.listeners]) listener();
  }
};
function createSidebarStore() {
  return new SidebarStore();
}

// src/client/service.ts
function extOfPath(path) {
  const at = path.lastIndexOf(".");
  if (at === -1) return "";
  const base = path.slice(at + 1).toLowerCase();
  return base.includes("/") || base.includes("\\") ? "" : base;
}
function baseNameOf(path) {
  const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return at === -1 ? path : path.slice(at + 1);
}
function matchUrlTarget(tabs, url) {
  for (const tab of tabs) {
    if (tab.urlTarget === void 0) continue;
    let claimed = false;
    try {
      claimed = tab.urlTarget(url) === true;
    } catch (error) {
      console.error("[dsh-better-sidebar] urlTarget error:", error);
      continue;
    }
    if (claimed) return tab;
  }
  return void 0;
}
var SIDEBAR_SERVICE_VERSION = "0.13.1";
var SIDEBAR_FEATURES = [
  "badge",
  "tabLifecycle",
  "updateTab",
  "openFile",
  "targetedOpen",
  "stateSubscription",
  "tabMeta",
  "pluginSettings",
  "urlTarget",
  "settingSelect"
];
function safeCall(fn) {
  try {
    fn();
  } catch (error) {
    console.error("[dsh-better-sidebar] plugin callback error:", error);
  }
}
function createBetterSidebarService(store) {
  const tabs = /* @__PURE__ */ new Map();
  const viewers = /* @__PURE__ */ new Map();
  const listeners = /* @__PURE__ */ new Set();
  const notify = () => {
    for (const fn of [...listeners]) fn();
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  const registerTab = (descriptor) => {
    if (tabs.has(descriptor.id)) {
      throw new Error(`[dsh-better-sidebar] tab type "${descriptor.id}" already registered`);
    }
    tabs.set(descriptor.id, descriptor);
    notify();
    return () => {
      if (tabs.get(descriptor.id) === descriptor) {
        tabs.delete(descriptor.id);
        notify();
      }
    };
  };
  const registerFileViewer = (descriptor) => {
    if (viewers.has(descriptor.id)) {
      throw new Error(`[dsh-better-sidebar] file viewer "${descriptor.id}" already registered`);
    }
    viewers.set(descriptor.id, descriptor);
    notify();
    return () => {
      if (viewers.get(descriptor.id) === descriptor) {
        viewers.delete(descriptor.id);
        notify();
      }
    };
  };
  const getTabs = () => Array.from(tabs.values());
  const getFileViewers = () => Array.from(viewers.values());
  const getTab = (id) => tabs.get(id);
  const isTabEnabled = (id) => store.getPrefs().tabsEnabled[id] !== false;
  const isViewerEnabled = (id) => store.getPrefs().viewersEnabled[id] !== false;
  const matchFileViewer = (path, head) => {
    const ext = extOfPath(path);
    for (const v of Array.from(viewers.values()).sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    )) {
      if (!isViewerEnabled(v.id)) continue;
      if (head !== void 0 && v.detect !== void 0) {
        if (v.detect(path, head)) return v;
        if (v.exts.length === 0) continue;
      } else if (v.exts.length === 0) {
        if (v.detect === void 0) return v;
        continue;
      }
      if (v.exts.includes(ext)) return v;
    }
    return void 0;
  };
  const openTab = (seed, scope) => {
    if (!isTabEnabled(seed.type)) {
      console.warn(`[dsh-better-sidebar] tab type "${seed.type}" is disabled in the side card settings`);
      return;
    }
    const descriptor = tabs.get(seed.type);
    if (descriptor === void 0) return;
    const targetSessionId = scope?.sessionId ?? store.getSnapshot().sessionId;
    if (targetSessionId === void 0) return;
    const callbackScope = scope ?? { sessionId: targetSessionId };
    const activeSessionId = store.getSnapshot().sessionId;
    const targetsInactiveSession = scope !== void 0 && scope.sessionId !== activeSessionId;
    let created;
    let activated;
    const reducer = (state) => {
      let tab;
      let next;
      if (descriptor.createTab !== void 0) {
        const result = descriptor.createTab(state);
        if (result === null) return state;
        tab = result.tab;
        next = applyDedupe(state, result.tab, descriptor);
        if (result.patch !== void 0) next = { ...next, ...result.patch };
      } else {
        tab = {
          id: seed.id ?? seed.type,
          type: seed.type,
          // A caller-provided title wins (the editor shows the file name);
          // otherwise the descriptor's (possibly i18n) title is the default.
          title: seed.title ?? (typeof descriptor.title === "function" ? descriptor.title() : descriptor.title),
          ...seed.path !== void 0 ? { path: seed.path } : {},
          ...seed.diff !== void 0 ? { diff: seed.diff } : {},
          ...seed.meta !== void 0 ? { meta: seed.meta } : {}
        };
        next = applyDedupe(state, tab, descriptor);
      }
      const dedupeKey = descriptor.dedupeKey ?? (descriptor.single === true ? () => descriptor.id : void 0);
      const key = dedupeKey?.(tab);
      const inputTabs = allLeaves(state.splits).concat(allLeaves(state.bottomSplits)).flatMap((leaf) => leaf.tabs);
      const existedByKey = key !== void 0 && inputTabs.some((candidate) => candidate.type === tab.type && dedupeKey(candidate) === key);
      const existedById = tabOpenIn(state, tab.id);
      const isCreation = !existedByKey && !existedById;
      let landed = next;
      if (seed.url !== void 0 && isCreation) {
        landed = patchTab(next, tab.id, {
          path: seed.url,
          ...seed.title !== void 0 ? { title: seed.title } : {}
        });
      }
      if (isCreation) {
        const landedTabs = allLeaves(landed.splits).concat(allLeaves(landed.bottomSplits)).flatMap((leaf) => leaf.tabs);
        created = landedTabs.find((candidate) => candidate.id === tab.id) ?? tab;
      } else {
        const candidates = allLeaves(landed.splits).concat(allLeaves(landed.bottomSplits)).flatMap((leaf) => leaf.tabs);
        activated = key !== void 0 ? candidates.find((candidate) => candidate.type === tab.type && dedupeKey(candidate) === key) : candidates.find((candidate) => candidate.id === tab.id);
        activated ??= tab;
      }
      if (!targetsInactiveSession && typeof window !== "undefined" && (seed.path !== void 0 || seed.url !== void 0)) {
        if (isNarrowWidth(window.innerWidth)) {
          if (!landed.panelOpen) return togglePanel(landed);
        } else {
          const hostKey = treeOf(landed, landed.activePane ?? "");
          if (hostKey === "bottomSplits") {
            if (!landed.bottomOpen) return { ...landed, bottomOpen: true };
          } else if (!landed.panelOpen) {
            return togglePanel(landed);
          }
        }
      }
      return landed;
    };
    if (targetsInactiveSession) {
      store.reduceFor(scope.sessionId, reducer);
    } else {
      store.reduce(reducer);
    }
    if (created !== void 0) safeCall(() => descriptor.onOpen?.(created, callbackScope));
    else if (activated !== void 0) safeCall(() => descriptor.onActivate?.(activated, callbackScope));
  };
  const closeTab2 = (tabId, scope) => {
    let closed;
    store.reduce((state) => {
      if (!tabOpenIn(state, tabId)) return state;
      const paneId = findPaneIdOf(state, tabId);
      const leaf = leafWithTab(state[treeOf(state, paneId)], tabId);
      closed = leaf?.tabs.find((tab) => tab.id === tabId);
      return closeTab(state, paneId, tabId);
    });
    if (closed !== void 0) {
      const sessionId = scope?.sessionId ?? store.getSnapshot().sessionId;
      if (sessionId !== void 0) {
        const descriptor = tabs.get(closed.type);
        safeCall(() => descriptor?.onClose?.(closed, scope ?? { sessionId }));
      }
    }
  };
  const getSnapshot = () => store.getSnapshot();
  const subscribeState = (listener) => store.subscribe(listener);
  const updateTab = (tabId, patch) => {
    store.reduce((state) => patchTab(state, tabId, {
      ...patch.title !== void 0 ? { title: patch.title } : {},
      ...patch.path !== void 0 ? { path: patch.path } : {},
      ...patch.meta !== void 0 ? { meta: patch.meta } : {}
    }));
  };
  const activateTab2 = (tabId, scope) => {
    let activated;
    store.reduce((state) => {
      if (!tabOpenIn(state, tabId)) return state;
      const paneId = findPaneIdOf(state, tabId);
      const leaf = leafWithTab(state[treeOf(state, paneId)], tabId);
      activated = leaf?.tabs.find((tab) => tab.id === tabId);
      return activateTab(state, paneId, tabId);
    });
    if (activated !== void 0) {
      const sessionId = scope?.sessionId ?? store.getSnapshot().sessionId;
      if (sessionId !== void 0) {
        const descriptor = tabs.get(activated.type);
        safeCall(() => descriptor?.onActivate?.(activated, scope ?? { sessionId }));
      }
    }
  };
  const openFile = (scope, path, title) => {
    openTab({ type: "editor", title: title ?? baseNameOf(path), path, id: `editor:${path}` }, scope);
  };
  return {
    registerTab,
    registerFileViewer,
    getTabs,
    getFileViewers,
    getTab,
    isTabEnabled,
    isViewerEnabled,
    matchFileViewer,
    openTab,
    closeTab: closeTab2,
    subscribe,
    version: SIDEBAR_SERVICE_VERSION,
    features: SIDEBAR_FEATURES,
    getSnapshot,
    subscribeState,
    updateTab,
    activateTab: activateTab2,
    openFile
  };
}
function applyDedupe(state, tab, descriptor) {
  const dedupeKey = descriptor.dedupeKey ?? (descriptor.single === true ? () => descriptor.id : void 0);
  const key = dedupeKey?.(tab);
  if (key !== void 0) {
    for (const leaf of allLeaves(state.splits).concat(allLeaves(state.bottomSplits))) {
      const existing = leaf.tabs.find((t2) => t2.type === tab.type && dedupeKey(t2) === key);
      if (existing !== void 0) return activateTab(state, leaf.id, existing.id);
    }
  }
  return openTabInActivePane(state, tab);
}
function findPaneIdOf(state, tabId) {
  for (const leaf of allLeaves(state.splits).concat(allLeaves(state.bottomSplits))) {
    if (leaf.tabs.some((t2) => t2.id === tabId)) return leaf.id;
  }
  return state.activePane ?? "";
}

// src/client/chunk-loader.ts
var CHUNK_EXTERNALS = [
  "react",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "cordis",
  "@deepseek-ai/dsh-client-ui-slots",
  "@deepseek-ai/dsh-client-web-react",
  "@deepseek-ai/dsh-client-ui-primitives",
  "@deepseek-ai/dsh-client-schema-form",
  "@deepseek-ai/dsh-client-runtime/client"
];
var CHUNK_URL = (name) => `/sidebar/bundle/${name}.js`;
function moduleSystem() {
  return globalThis.__DSH_MODULES__;
}
function chunkRegistry() {
  const g = globalThis;
  return g.__dshChunks__ ??= {};
}
var defaultScriptLoader = (src) => new Promise((resolve, reject) => {
  const el = document.createElement("script");
  el.async = true;
  el.src = src;
  el.addEventListener("load", () => {
    el.remove();
    resolve();
  }, { once: true });
  el.addEventListener("error", () => {
    el.remove();
    reject(new Error(`[dsh-better-sidebar] chunk script ${src} failed to load`));
  }, { once: true });
  document.head.append(el);
});
var scriptLoader = defaultScriptLoader;
var testLoaders = /* @__PURE__ */ new Map();
var externalsRequire;
async function buildExternalsRequire(modules) {
  if (externalsRequire !== void 0) return externalsRequire;
  const entries = await Promise.all(CHUNK_EXTERNALS.map(async (spec) => {
    try {
      return [spec, await modules.import(spec)];
    } catch {
      return [spec, void 0];
    }
  }));
  const table = new Map(entries);
  externalsRequire = (spec) => {
    if (!table.has(spec)) {
      throw new Error(`[dsh-better-sidebar] chunk require('${spec}') missed the module table`);
    }
    return table.get(spec);
  };
  return externalsRequire;
}
var cache = /* @__PURE__ */ new Map();
function loadChunk(name) {
  const cached = cache.get(name);
  if (cached !== void 0) return cached;
  const task = (async () => {
    const test = testLoaders.get(name);
    if (test !== void 0) return test();
    const modules = moduleSystem();
    if (modules === void 0) {
      throw new Error(`[dsh-better-sidebar] chunk "${name}": client module system unavailable`);
    }
    await scriptLoader(CHUNK_URL(name));
    const factory = chunkRegistry()[name];
    if (typeof factory !== "function") {
      throw new Error(`[dsh-better-sidebar] chunk "${name}" script did not register its factory`);
    }
    const require2 = await buildExternalsRequire(modules);
    return factory(require2);
  })();
  cache.set(name, task);
  void task.catch(() => {
    cache.delete(name);
  });
  return task;
}
function resetChunks() {
  cache.clear();
  testLoaders.clear();
  externalsRequire = void 0;
}

// src/client/builtins/tabs.tsx
var import_dsh_client_ui_primitives9 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/locales.ts
var zh = {
  files: "\u6587\u4EF6",
  explorer: "\u8D44\u6E90\u7BA1\u7406\u5668",
  git: "\u6E90\u4EE3\u7801\u7BA1\u7406",
  terminal: "\u7EC8\u7AEF",
  editor: "\u7F16\u8F91\u5668",
  editorExplorer: "\u6587\u4EF6\u6253\u5F00\u65B9\u5F0F",
  editorExplorerDesc: "\u63A7\u5236\u6587\u4EF6\u6253\u5F00\u65B9\u5F0F",
  editorExplorerMerged: "\u5408\u5E76",
  editorExplorerMergedDesc: "\u6587\u4EF6\u5728\u540C\u4E00\u7A97\u53E3\u5185\u539F\u5730\u5207\u6362\uFF1B\u65B0\u7A97\u53E3\u9ED8\u8BA4\u5C55\u5F00\u6587\u4EF6\u6811",
  editorExplorerSplit: "\u72EC\u7ACB",
  editorExplorerSplitDesc: "\u65E0\u8DEF\u5F84\u7A97\u53E3\u5373\u8D44\u6E90\u7BA1\u7406\u5668\uFF08\u4EC5\u6587\u4EF6\u6811\uFF09\uFF1B\u6587\u4EF6\u5404\u81EA\u65B0\u5F00\u7A97\u53E3\uFF08\u5E26\u6587\u4EF6\u6811\uFF0C\u9ED8\u8BA4\u6536\u8D77\uFF09",
  editorTreeToggle: "\u6587\u4EF6\u6811\u9762\u677F",
  editorPathPlaceholder: "\u8F93\u5165\u6587\u4EF6\u8DEF\u5F84\uFF08\u76F8\u5BF9\u4F1A\u8BDD\u76EE\u5F55\u6216\u7EDD\u5BF9\u8DEF\u5F84\uFF09\uFF0CEnter \u6253\u5F00",
  editorSearchPlaceholder: "\u6309\u6587\u4EF6\u540D\u641C\u7D22\u2026",
  editorSearchNoResults: "\u65E0\u5339\u914D\u6587\u4EF6",
  editorSearchTruncated: "\u7ED3\u679C\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u90E8\u5206\u5339\u914D",
  editorEmptyHint: "\u4ECE\u53F3\u4FA7\u6587\u4EF6\u6811\u6216\u4E0A\u65B9\u8DEF\u5F84\u8F93\u5165\u6846\u9009\u62E9\u6587\u4EF6\u5F00\u59CB\u9884\u89C8",
  openFileNewTab: "\u5728\u65B0 Tab \u4E2D\u6253\u5F00",
  openFileSide: "\u5728\u4FA7\u8FB9\u6253\u5F00",
  newTab: "\u65B0\u5EFA\u6807\u7B7E\u9875",
  openExplorer: "\u8D44\u6E90\u7BA1\u7406\u5668",
  brokenSymlink: "\u5931\u6548\u7684\u8F6F\u94FE\u63A5",
  openGit: "Git \u9762\u677F",
  newTerminal: "\u65B0\u7EC8\u7AEF",
  terminalLimit: "\u7EC8\u7AEF\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650 (3)",
  close: "\u5173\u95ED",
  collapse: "\u6298\u53E0\u4FA7\u8FB9\u680F",
  expand: "\u5C55\u5F00\u4FA7\u8FB9\u680F",
  collapseBottomPanel: "\u6298\u53E0\u5E95\u90E8\u9762\u677F",
  expandBottomPanel: "\u5C55\u5F00\u5E95\u90E8\u9762\u677F",
  swapPanelSide: "\u8C03\u6362\u4F1A\u8BDD\u4E0E\u4FA7\u8FB9\u680F\u4F4D\u7F6E",
  terminalError: "\u7EC8\u7AEF\u8FDE\u63A5\u5931\u8D25",
  terminalConnectFailed: "\u7EC8\u7AEF\u591A\u6B21\u8FDE\u63A5\u5931\u8D25",
  terminalRetry: "\u91CD\u8BD5",
  terminalDepsFailed: "\u7EC8\u7AEF\u4F9D\u8D56 node-pty \u52A0\u8F7D\u5931\u8D25",
  terminalDepsHint: "\u5728 DSH \u6240\u5728\u73AF\u5883\u7684\u7EC8\u7AEF\u6216 cmd \u4E2D\u6267\u884C\u4EE5\u4E0B\u547D\u4EE4\u4FEE\u590D\uFF0C\u7136\u540E\u70B9\u91CD\u8BD5\uFF08node-pty \u4E0E DSH \u6838\u5FC3\u4FDD\u6301\u540C\u4E00\u7248\u672C\uFF09\uFF1A",
  terminalDepsProfile: "\uFF08\u68C0\u6D4B\u5230 profile\uFF1A{profile}\uFF09",
  preview: "\u9884\u89C8",
  edit: "\u7F16\u8F91",
  mermaidError: "Mermaid \u6E32\u67D3\u5931\u8D25",
  mermaidZoomIn: "\u653E\u5927",
  mermaidZoomOut: "\u7F29\u5C0F",
  mermaidZoomReset: "\u91CD\u7F6E",
  mermaidZoomHint: "\u6EDA\u8F6E\u7F29\u653E \xB7 \u62D6\u62FD\u5E73\u79FB \xB7 Esc \u5173\u95ED",
  refresh: "\u5237\u65B0",
  save: "\u4FDD\u5B58",
  saved: "\u5DF2\u4FDD\u5B58",
  unsaved: "\u672A\u4FDD\u5B58",
  saveFailed: "\u4FDD\u5B58\u5931\u8D25",
  truncation: "\u6587\u4EF6\u8FC7\u5927\uFF0C\u4EC5\u663E\u793A\u524D 512KB",
  binary: "\u4E8C\u8FDB\u5236\u6587\u4EF6\uFF0C\u65E0\u6CD5\u9884\u89C8",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  error: "\u52A0\u8F7D\u5931\u8D25",
  retry: "\u91CD\u8BD5",
  splitLeft: "\u5411\u5DE6\u5206\u680F",
  splitRight: "\u5411\u53F3\u5206\u680F",
  splitUp: "\u5411\u4E0A\u5206\u680F",
  splitDown: "\u5411\u4E0B\u5206\u680F",
  notRepo: "\u5F53\u524D\u76EE\u5F55\u4E0D\u662F git \u4ED3\u5E93",
  noChanges: "\u6CA1\u6709\u53D8\u66F4",
  stage: "\u6682\u5B58",
  unstage: "\u53D6\u6D88\u6682\u5B58",
  stageAll: "\u5168\u90E8\u6682\u5B58",
  unstageAll: "\u5168\u90E8\u53D6\u6D88\u6682\u5B58",
  commitPlaceholder: "\u63D0\u4EA4\u4FE1\u606F (Ctrl+Enter)",
  commit: "\u63D0\u4EA4",
  commitError: "\u63D0\u4EA4\u5931\u8D25",
  branch: "\u5206\u652F",
  checkoutError: "\u5207\u6362\u5206\u652F\u5931\u8D25",
  history: "\u5386\u53F2",
  changes: "\u53D8\u66F4",
  staged: "\u5DF2\u6682\u5B58",
  unstaged: "\u672A\u6682\u5B58",
  cancel: "\u53D6\u6D88",
  diffEmpty: "\u6CA1\u6709\u6587\u672C\u5DEE\u5F02",
  diffLoadError: "\u52A0\u8F7D\u5DEE\u5F02\u5931\u8D25",
  diffBinary: "\u4E8C\u8FDB\u5236",
  diffAdded: "\u65B0\u589E",
  diffDeleted: "\u5220\u9664",
  diffRenamed: "\u91CD\u547D\u540D",
  diffExpand: "\u5C55\u5F00\u5176\u4F59 {count} \u884C",
  diffCollapse: "\u6536\u8D77",
  discard: "\u653E\u5F03\u66F4\u6539",
  discardTitle: "\u653E\u5F03\u66F4\u6539",
  discardDesc: "\u5C06\u4E22\u5F03\u300C{path}\u300D\u7684\u5DE5\u4F5C\u533A\u4FEE\u6539\uFF08\u4E0D\u53EF\u6062\u590D\uFF09\u3002",
  viewCommitDiff: "\u67E5\u770B\u63D0\u4EA4\u5DEE\u5F02",
  copyShortHash: "\u590D\u5236\u77ED\u54C8\u5E0C",
  copyFullHash: "\u590D\u5236\u5B8C\u6574\u54C8\u5E0C",
  copySubject: "\u590D\u5236\u63D0\u4EA4\u4FE1\u606F",
  revertCommit: "\u8FD8\u539F\u6B64\u63D0\u4EA4",
  revertTitle: "\u8FD8\u539F\u6B64\u63D0\u4EA4",
  revertDesc: "\u5C06\u5728\u5F53\u524D\u5206\u652F\u521B\u5EFA\u4E00\u4E2A\u53CD\u8F6C\u300C{subject}\u300D\u7684\u65B0\u63D0\u4EA4\u3002",
  cherryPickCommit: "\u6361\u53D6\u6B64\u63D0\u4EA4",
  cherryPickTitle: "\u6361\u53D6\u6B64\u63D0\u4EA4",
  cherryPickDesc: "\u5C06\u300C{subject}\u300D\u7684\u66F4\u6539\u5E94\u7528\u5230\u5F53\u524D\u5206\u652F\u3002",
  timeJustNow: "\u521A\u521A",
  timeMinutesAgo: "{n} \u5206\u949F\u524D",
  timeHoursAgo: "{n} \u5C0F\u65F6\u524D",
  timeYesterday: "\u6628\u5929",
  loadMore: "\u52A0\u8F7D\u66F4\u591A",
  historyLoadError: "\u52A0\u8F7D\u66F4\u591A\u5386\u53F2\u5931\u8D25",
  produced: "\u672C\u6B21\u4EA7\u51FA",
  producedOpen: "\u5728\u4FA7\u8FB9\u680F\u4E2D\u6253\u5F00",
  disconnected: "\u7EC8\u7AEF\u8FDE\u63A5\u65AD\u5F00\uFF0C\u91CD\u8FDE\u4E2D\u2026",
  exited: "\u7EC8\u7AEF\u8FDB\u7A0B\u5DF2\u9000\u51FA",
  noSession: "\u9009\u62E9\u4E00\u4E2A\u4F1A\u8BDD\u4EE5\u4F7F\u7528\u4FA7\u8FB9\u680F",
  pluginNotLoaded: "\u63D2\u4EF6\u672A\u52A0\u8F7D\uFF0C\u6807\u7B7E\u9875\u6682\u4E0D\u53EF\u7528\uFF1A",
  hiddenFiles: "\u9690\u85CF\u6587\u4EF6",
  parent: "\u4E0A\u7EA7\u76EE\u5F55",
  copied: "\u5DF2\u590D\u5236",
  copy: "\u590D\u5236",
  newFile: "\u65B0\u6587\u4EF6",
  openEditor: "\u6253\u5F00\u7F16\u8F91\u5668",
  gitDetail: "\u67E5\u770B\u53D8\u66F4\u8BE6\u60C5",
  referenceFile: "@\u6587\u4EF6",
  addToConversation: "\u6DFB\u52A0\u5230\u5BF9\u8BDD",
  copyRelative: "\u590D\u5236\u76F8\u5BF9\u5730\u5740",
  copyAbsolute: "\u590D\u5236\u7EDD\u5BF9\u5730\u5740",
  download: "\u4E0B\u8F7D",
  settingsNav: "\u4FA7\u8FB9\u5361\u7247",
  settingsIntro: "\u7BA1\u7406\u4FA7\u8FB9\u5361\u7247\u7684\u663E\u793A\u5185\u5BB9\u4E0E\u9ED8\u8BA4\u884C\u4E3A",
  settingsPopupDesc: "\u4E3A\u300C{feature}\u300D\u914D\u7F6E\u76F8\u5173\u9009\u9879",
  settingsDone: "\u5B8C\u6210",
  settingsOpenTitle: "\u65B0\u4F1A\u8BDD\u9ED8\u8BA4\u6253\u5F00",
  settingsOpenDesc: "\u65B0\u5EFA\u4F1A\u8BDD\u65F6\u81EA\u52A8\u5C55\u5F00\u4FA7\u8FB9\u5361\u7247\uFF1B\u5DF2\u5B58\u5728\u7684\u4F1A\u8BDD\u4FDD\u6301\u5404\u81EA\u5E03\u5C40",
  settingsWidthTitle: "\u9ED8\u8BA4\u5BBD\u5EA6\u5360\u6BD4",
  settingsWidthDesc: "\u65B0\u5EFA\u4F1A\u8BDD\u65F6\u4FA7\u8FB9\u5361\u7247\u5360\u7A97\u53E3\u5BBD\u5EA6\u7684\u767E\u5206\u6BD4 (20\u201360)",
  settingsWidthSuffix: "%",
  settingsOpenPathTitle: "\u804A\u5929\u533A\u6587\u4EF6\u5728\u4FA7\u8FB9\u680F\u6253\u5F00",
  settingsOpenPathDesc: "\u5728\u804A\u5929\u91CC\u70B9\u51FB\u6587\u4EF6\u94FE\u63A5\uFF08\u5DE5\u5177\u884C\u3001\u4EA7\u7269\u5217\u8868\u3001\u6587\u4EF6\u63D0\u53CA\uFF09\u65F6\uFF0C\u5728\u4FA7\u8FB9\u680F\u7F16\u8F91\u5668\u4E2D\u6253\u5F00\uFF0C\u4E0D\u518D\u8C03\u7528\u7CFB\u7EDF\u9ED8\u8BA4\u5E94\u7528",
  settingsTitleBarTitle: "\u4F4D\u7F6E\u517C\u5BB9\u6A21\u5F0F",
  settingsTitleBarDesc: "\u4E3A Windows \u53F3\u4E0A\u89D2\u7684\u539F\u751F\u6807\u9898\u680F\u9884\u7559\u7A7A\u95F4\uFF1A\u4FA7\u8FB9\u680F\u6309\u94AE\u4E0E\u4FA7\u8FB9\u680F\u5185\u5BB9\u6574\u4F53\u4E0B\u79FB\uFF0C\u907F\u514D\u88AB\u6807\u9898\u680F\u906E\u6321",
  settingsTitleBarStripTitle: "\u4E0B\u79FB\u8DDD\u79BB",
  settingsTitleBarStripDesc: "\u6807\u9898\u680F\u6761\u5E26\u9AD8\u5EA6\uFF1A\u4FA7\u8FB9\u680F\u6309\u94AE\u4E0E\u5185\u5BB9\u4E0B\u79FB\u7684\u50CF\u7D20\u6570\uFF080\u2013120\uFF0C\u9ED8\u8BA4 40\uFF09",
  settingsSaveFailed: "\u4FDD\u5B58\u5931\u8D25",
  settingsConflict: "\u8BBE\u7F6E\u5DF2\u88AB\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\uFF0C\u8BF7\u91CD\u8BD5",
  binaryNoPreview: "\u6B64\u6587\u4EF6\u7C7B\u578B\u4E0D\u652F\u6301\u9884\u89C8",
  downloadToView: "\u4E0B\u8F7D\u67E5\u770B",
  settingsSubagentTitle: "\u68C0\u6D4B\u5230\u5B50\u4EE3\u7406\u65F6\u81EA\u52A8\u5C55\u5F00\u4EFB\u52A1\u7BA1\u7406\u9875",
  settingsSubagentDesc: "\u5F53\u524D\u4F1A\u8BDD\u4EA7\u751F\u65B0\u7684\u5B50\u4EE3\u7406\u65F6\uFF0C\u81EA\u52A8\u5C55\u5F00\u4FA7\u8FB9\u680F\u5E76\u6253\u5F00\u4EFB\u52A1\u7BA1\u7406\u9875\uFF1B\u5173\u95ED\u540E\u9700\u624B\u52A8\u6253\u5F00",
  settingsJobsTitle: "\u6709\u65B0\u540E\u53F0\u4EFB\u52A1\u65F6\u81EA\u52A8\u5C55\u5F00\u540E\u53F0\u4EFB\u52A1\u9875",
  settingsJobsDesc: "\u5F53\u524D\u4F1A\u8BDD\u51FA\u73B0\u65B0\u7684\u540E\u53F0\u4EFB\u52A1\u65F6\uFF0C\u81EA\u52A8\u5C55\u5F00\u4FA7\u8FB9\u680F\u5E76\u6253\u5F00\u540E\u53F0\u4EFB\u52A1\u9875\uFF08\u6BCF\u4E2A\u65B0\u4EFB\u52A1\u90FD\u4F1A\u89E6\u53D1\uFF09\uFF1B\u5173\u95ED\u540E\u9700\u624B\u52A8\u6253\u5F00",
  settingsToolsTitle: "\u4E3A\u6A21\u578B\u6CE8\u5165\u7EC8\u7AEF\u5DE5\u5177",
  settingsToolsDesc: "\u5F00\u542F\u540E\uFF0C\u6A21\u578B\u53EF\u901A\u8FC7 terminal_create \u7B49 8 \u4E2A\u5DE5\u5177\u521B\u5EFA\u5E76\u64CD\u4F5C\u4FA7\u8FB9\u680F\u7EC8\u7AEF\uFF08\u9ED8\u8BA4\u5173\u95ED\uFF09",
  settingsBottomTerminalTitle: "\u5E95\u90E8\u9762\u677F\u9996\u6B21\u5C55\u5F00\u81EA\u52A8\u5F00\u7EC8\u7AEF",
  settingsBottomTerminalDesc: "\u6BCF\u6B21\u4F1A\u8BDD\u4E2D\u7B2C\u4E00\u6B21\u5C55\u5F00\u5E95\u90E8\u9762\u677F\u65F6\uFF0C\u5C1D\u8BD5\u5728\u5E95\u90E8\u9762\u677F\u81EA\u52A8\u6253\u5F00\u4E00\u4E2A\u65B0\u7EC8\u7AEF\u6807\u7B7E\uFF08\u7EC8\u7AEF\u6570\u91CF\u4E0A\u9650\u4ECD\u4F1A\u9650\u5236\uFF1B\u9ED8\u8BA4\u5F00\u542F\uFF09",
  settingsFontFamilyTitle: "\u7EC8\u7AEF\u5B57\u4F53",
  settingsFontFamilyDesc: '\u81EA\u5B9A\u4E49\u7EC8\u7AEF\u5B57\u4F53\u65CF\uFF08CSS font-family\uFF0C\u5982 "JetBrains Mono", monospace\uFF1B\u7559\u7A7A\u8DDF\u968F\u4E3B\u9898\u7B49\u5BBD\u5B57\u4F53\uFF09',
  settingsFontFamilyPlaceholder: '"JetBrains Mono", monospace',
  settingsFontSizeTitle: "\u7EC8\u7AEF\u5B57\u53F7",
  settingsFontSizeDesc: "\u7EC8\u7AEF\u5B57\u53F7\uFF089\u201332\uFF0C\u9ED8\u8BA4 13\uFF09",
  settingsFontSizeSuffix: "px",
  settingsTabsTitle: "\u4FA7\u8FB9\u680F\u5185\u5BB9",
  settingsViewersTitle: "\u6587\u4EF6\u9884\u89C8",
  settingsGeneralTitle: "\u5E38\u89C4",
  settingsPopup: "\u529F\u80FD\u8BBE\u7F6E",
  settingsViewerCatchAll: "\u515C\u5E95\uFF1A\u4EFB\u610F\u6587\u4EF6",
  viewerImage: "\u56FE\u7247",
  viewerPdf: "PDF",
  viewerMarkdown: "Markdown",
  viewerCode: "\u4EE3\u7801",
  viewerBinary: "\u4E8C\u8FDB\u5236\u4E0B\u8F7D",
  viewerHtml: "HTML",
  browser: "\u6D4F\u89C8\u5668",
  browserPlaceholder: "\u8F93\u5165\u7F51\u5740\uFF0C\u4F8B\u5982 example.com",
  browserGo: "\u524D\u5F80",
  browserBack: "\u540E\u9000",
  browserForward: "\u524D\u8FDB",
  browserStart: "\u8F93\u5165\u7F51\u5740\u5F00\u59CB\u6D4F\u89C8\uFF08\u6C99\u7BB1\u6A21\u5F0F\uFF09",
  browserBlockedScheme: "\u5DF2\u963B\u6B62\uFF1A\u4EC5\u652F\u6301 http/https \u94FE\u63A5",
  browserBlockedLoopback: "\u5DF2\u963B\u6B62\uFF1A\u4E0D\u5141\u8BB8\u5728\u6D4F\u89C8\u5668\u4E2D\u8BBF\u95EE\u672C\u673A\u6216\u5185\u90E8\u5730\u5740",
  browserInvalid: "\u65E0\u6548\u7684\u7F51\u5740",
  browserNoSandboxWarning: "\u6C99\u7BB1\u5DF2\u5173\u95ED\uFF1A\u5F53\u524D\u9875\u9762\u4E0E\u754C\u9762\u540C\u6E90\uFF0C\u62E5\u6709\u5B8C\u6574\u4F1A\u8BDD\u6743\u9650\uFF08\u53EF\u5728\u8BBE\u7F6E\u4E2D\u6062\u590D\uFF09",
  htmlNoSandboxWarning: "\u6C99\u7BB1\u5DF2\u5173\u95ED\uFF1A\u6B64 HTML \u4E0E\u754C\u9762\u540C\u6E90\uFF0C\u53EF\u8BFB\u53D6\u4F1A\u8BDD\u6587\u4EF6\u4E0E\u5185\u90E8\u63A5\u53E3\uFF08\u53EF\u5728\u8BBE\u7F6E\u4E2D\u6062\u590D\uFF09",
  sandboxStatusOn: "\u6C99\u7BB1\u6A21\u5F0F\uFF1A\u5DF2\u542F\u7528 \xB7 \u9875\u9762\u65E0\u6CD5\u8BBF\u95EE\u754C\u9762\u6570\u636E\u4E0E\u672C\u5730\u6587\u4EF6\uFF0C\u767B\u5F55\u6001\u4E0E\u7B2C\u4E09\u65B9 Cookie \u53EF\u80FD\u4E0D\u53EF\u7528",
  sandboxUnlock: "\u4E34\u65F6\u89E3\u9501\uFF08\u4E0D\u5B89\u5168\uFF09",
  sandboxRestore: "\u6062\u590D\u6C99\u7BB1",
  settingsHtmlDefaultUnsafeTitle: "HTML \u9884\u89C8\u9ED8\u8BA4\u4EE5\u975E\u6C99\u7BB1\u6A21\u5F0F\u6253\u5F00\uFF08\u4E0D\u5B89\u5168\uFF09",
  settingsHtmlDefaultUnsafeDesc: "\u5F00\u542F\u540E\uFF0C\u6BCF\u6B21\u6253\u5F00 HTML \u6587\u4EF6\u65F6\u9884\u89C8\u9ED8\u8BA4\u5904\u4E8E\u975E\u6C99\u7BB1\u72B6\u6001\uFF08\u4E0E\u754C\u9762\u540C\u6E90\uFF0C\u53EF\u8BFB\u53D6\u4F1A\u8BDD\u6587\u4EF6\u4E0E\u5185\u90E8\u63A5\u53E3\uFF09\uFF1B\u53EF\u5728\u72B6\u6001\u884C\u4E34\u65F6\u6062\u590D\u6C99\u7BB1",
  settingsHtmlSandboxTitle: "\u5173\u95ED HTML \u9884\u89C8\u6C99\u7BB1\uFF08\u4E0D\u5B89\u5168\uFF09",
  settingsHtmlSandboxDesc: "\u5173\u95ED\u540E\uFF0C\u9884\u89C8\u7684 HTML \u5C06\u4E0E\u754C\u9762\u540C\u6E90\u8FD0\u884C\uFF0C\u53EF\u8BFB\u53D6\u4F1A\u8BDD\u6587\u4EF6\u3001\u672C\u5730\u5B58\u50A8\u5E76\u8C03\u7528\u5185\u90E8\u63A5\u53E3\u3002\u4EC5\u5BF9\u5B8C\u5168\u53EF\u4FE1\u7684\u6587\u4EF6\u5F00\u542F",
  settingsBrowserSandboxTitle: "\u5173\u95ED\u6D4F\u89C8\u5668\u6C99\u7BB1\uFF08\u4E0D\u5B89\u5168\uFF09",
  settingsBrowserSandboxDesc: "\u5173\u95ED\u540E\uFF0C\u8BBF\u95EE\u7684\u4EFB\u4F55\u7F51\u7AD9\u90FD\u5C06\u4E0E\u754C\u9762\u540C\u6E90\u8FD0\u884C\uFF0C\u53EF\u8BFB\u53D6\u4F1A\u8BDD\u6570\u636E\u5E76\u5192\u5145\u4F60\u7684\u767B\u5F55\u72B6\u6001\u3002\u4EC5\u5BF9\u5B8C\u5168\u53EF\u4FE1\u7684\u7AD9\u70B9\u5F00\u542F",
  settingsBrowserLinksTitle: "\u804A\u5929\u533A\u5916\u94FE\u5728\u4FA7\u8FB9\u680F\u6253\u5F00",
  settingsBrowserLinksDesc: "\u5F00\u542F\u540E\uFF0C\u70B9\u51FB\u804A\u5929\u6216\u754C\u9762\u4E2D\u7684\u5916\u94FE\u65F6\u5728\u4FA7\u8FB9\u680F\u6253\u5F00\uFF0C\u4E0D\u518D\u5F39\u51FA\u65B0\u7A97\u53E3\uFF1BHTTP \u4E0E HTTPS \u53EF\u5206\u522B\u901A\u8FC7\u4E0B\u65B9\u5F00\u5173\u63A7\u5236\uFF1BCtrl/Cmd \u70B9\u51FB\u53EF\u4E34\u65F6\u653E\u884C",
  settingsBrowserHttpTitle: "\u4FA7\u8FB9\u6253\u5F00HTTP\u7F51\u9875",
  settingsBrowserHttpDesc: "\u5F00\u542F\u540E\uFF0C\u70B9\u51FB\u804A\u5929\u6216\u754C\u9762\u4E2D\u7684 HTTP \u5916\u94FE\u65F6\u5728\u4FA7\u8FB9\u680F\u6253\u5F00\uFF08\u58F0\u660E\u4E86 urlTarget \u7684\u63D2\u4EF6\u9875\u9762\u4F18\u5148\uFF09\uFF1BCtrl/Cmd \u70B9\u51FB\u53EF\u4E34\u65F6\u653E\u884C",
  settingsBrowserHttpsTitle: "\u4FA7\u8FB9\u6253\u5F00HTTPS\u7F51\u9875",
  settingsBrowserHttpsDesc: "\u5F00\u542F\u540E\uFF0C\u70B9\u51FB\u804A\u5929\u6216\u754C\u9762\u4E2D\u7684 HTTPS \u5916\u94FE\u65F6\u5728\u4FA7\u8FB9\u680F\u6253\u5F00\u3002\u9ED8\u8BA4\u5173\u95ED\uFF1A\u591A\u6570 HTTPS \u7AD9\u70B9\u62D2\u7EDD\u88AB\u5D4C\u5165\uFF0C\u8D70\u7CFB\u7EDF\u6D4F\u89C8\u5668\u66F4\u987A\u7545",
  browserOpenExternal: "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00",
  browserEmbedBlocked: "{host} \u62D2\u7EDD\u4E86\u5D4C\u5165\u8BF7\u6C42",
  browserEmbedBlockedDesc: "\u8BE5\u7AD9\u70B9\u901A\u8FC7 X-Frame-Options / frame-ancestors \u7981\u6B62\u5728\u5176\u5B83\u9875\u9762\u4E2D\u663E\u793A\uFF0C\u65E0\u6CD5\u5728\u4FA7\u8FB9\u680F\u5185\u52A0\u8F7D\u3002\u53EF\u5728\u6D4F\u89C8\u5668\u4E2D\u76F4\u63A5\u6253\u5F00",
  browserEmbedAnyway: "\u4ECD\u7136\u52A0\u8F7D",
  browserBridgeOpen: "\u5728 Chrome \u4E2D\u6253\u5F00",
  browserBridgeUnavailable: "Chrome \u6D4F\u89C8\u5668\u6865\u672A\u8FDE\u63A5",
  browserBridgeConnected: "\u5DF2\u8FDE\u63A5 Chrome \u6807\u7B7E\u9875",
  browserDesktopOpened: "\u5DF2\u5728\u684C\u9762 Browser \u9762\u677F\u6253\u5F00",
  subagent: "\u4EFB\u52A1\u7BA1\u7406",
  openSubagent: "\u4EFB\u52A1\u7BA1\u7406",
  subagentMainAgent: "\u4E3B\u4EE3\u7406",
  subagentEmpty: "\u6682\u65E0\u5B50\u4EE3\u7406",
  subagentEmptyDesc: "\u5F53\u524D\u4E3B\u4EE3\u7406\u6D3E\u751F\u7684\u5B50\u4EE3\u7406\u5C06\u663E\u793A\u5728\u8FD9\u91CC",
  subagentRunning: "\u8FD0\u884C\u4E2D",
  subagentInactive: "\u7A7A\u95F2",
  subagentModeOneShot: "\u4E00\u6B21\u6027",
  subagentModeContinuable: "\u53EF\u7EED\u63A5",
  subagentCount: "{count} \u4E2A\u5B50\u4EE3\u7406",
  subagentCountRunning: "{count} \u4E2A\u5B50\u4EE3\u7406 \xB7 {running} \u8FD0\u884C\u4E2D",
  subagentDiagCorrupt: "\u76EE\u5F55\u635F\u574F",
  subagentDiagUnsupported: "\u4E0D\u652F\u6301\u7684\u6761\u76EE",
  subagentDiagUnavailable: "\u4E0D\u53EF\u7528",
  subagentThinking: "\u601D\u8003\u4E2D\u2026",
  jobs: "\u540E\u53F0\u4EFB\u52A1",
  jobsCount: "{count} \u4E2A\u540E\u53F0\u4EFB\u52A1",
  jobsCountRunning: "{count} \u4E2A\u540E\u53F0\u4EFB\u52A1 \xB7 {running} \u8FD0\u884C\u4E2D",
  jobStatusRunning: "\u8FD0\u884C\u4E2D",
  jobStatusStopping: "\u7EC8\u6B62\u4E2D",
  jobStatusCompleted: "\u5DF2\u5B8C\u6210",
  jobStatusKilled: "\u5DF2\u7EC8\u6B62",
  jobStatusFailed: "\u5931\u8D25",
  jobDurationSeconds: "{seconds} \u79D2",
  jobDurationMinutes: "{minutes} \u5206 {seconds} \u79D2",
  jobDurationHours: "{hours} \u5C0F\u65F6 {minutes} \u5206",
  jobViewOutput: "\u67E5\u770B\u8F93\u51FA",
  jobHideOutput: "\u6536\u8D77\u8F93\u51FA",
  jobNoOutput: "\u6682\u65E0\u8F93\u51FA",
  jobNotReadYet: "\u7B49\u5F85\u6A21\u578B\u8BFB\u53D6\u8BE5\u4EFB\u52A1\u7684\u8F93\u51FA\uFF08\u6A21\u578B\u6267\u884C job_output \u540E\uFF0C\u8F93\u51FA\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\uFF09",
  jobOutputTruncated: "\u8F93\u51FA\u8FC7\u957F\uFF0C\u5DF2\u622A\u65AD\u663E\u793A",
  jobOutputError: "\u8F93\u51FA\u8BFB\u53D6\u5931\u8D25",
  jobKill: "\u7EC8\u6B62",
  jobKillConfirm: "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u7EC8\u6B62",
  jobKillError: "\u7EC8\u6B62\u5931\u8D25",
  addPluginsTabCard: "\u6DFB\u52A0 Tab \u63D2\u4EF6",
  addPluginsTabCardDesc: "\u6CE8\u518C\u65B0\u7684\u4FA7\u8FB9\u680F\u9875\u9762",
  addPluginsViewerCard: "\u6DFB\u52A0\u9884\u89C8\u63D2\u4EF6",
  addPluginsViewerCardDesc: "\u6CE8\u518C\u65B0\u7684\u6587\u4EF6\u7C7B\u578B\u9884\u89C8",
  addPluginsTabDesc: "\u4FA7\u8FB9\u680F\u9875\u9762\uFF08Tab\uFF09\u53EF\u4EE5\u7531\u63D2\u4EF6\u6269\u5C55\u3002\u63D2\u4EF6\u901A\u8FC7 ctx.betterSidebar \u670D\u52A1\u6CE8\u518C\uFF1B\u70B9\u51FB\u300C\u5B89\u88C5\u300D\u590D\u5236\u5B89\u88C5\u547D\u4EE4\uFF0C\u7C98\u8D34\u5230 DSH \u6240\u5728\u73AF\u5883\u7684\u7EC8\u7AEF\u6267\u884C\u3002",
  addPluginsViewerDesc: "\u6587\u4EF6\u9884\u89C8\u5668\u53EF\u4EE5\u7531\u63D2\u4EF6\u6269\u5C55\u3002\u63D2\u4EF6\u901A\u8FC7 ctx.betterSidebar \u670D\u52A1\u6CE8\u518C\uFF1B\u70B9\u51FB\u300C\u5B89\u88C5\u300D\u590D\u5236\u5B89\u88C5\u547D\u4EE4\uFF0C\u7C98\u8D34\u5230 DSH \u6240\u5728\u73AF\u5883\u7684\u7EC8\u7AEF\u6267\u884C\u3002",
  addPluginsBrowseMore: "\u5728 GitHub \u4E0A\u6D4F\u89C8\u66F4\u591A\u63D2\u4EF6\uFF08topic: dsh-better-sidebar\uFF09",
  addPluginsRecommended: "\u63A8\u8350\u63D2\u4EF6",
  addPluginsEmpty: "\u6682\u672A\u6536\u5F55\u63D2\u4EF6\uFF0C\u6B22\u8FCE\u5728 GitHub topic \u4E0B\u53D1\u5E03\u4F60\u7684\u63D2\u4EF6",
  openPlugin: "\u8DF3\u8F6C",
  copyInstall: "\u590D\u5236\u5B89\u88C5\u547D\u4EE4",
  pluginOfficeDesc: "\u4E3A better-sidebar \u7F16\u8F91\u5668\u63D0\u4F9B Office \u4E09\u4EF6\u5957\u9884\u89C8\uFF08.docx / .xlsx / .pptx\uFF09\uFF0C\u628A\u91CD\u578B Office \u6E32\u67D3\u5E93\u62C6\u51FA\u4E3B\u5305\u3001\u6309\u9700\u5B89\u88C5",
  pluginGitRemotesDesc: "better-sidebar Git \u8FDC\u7A0B Tab\uFF1A\u770B\u5206\u652F/\u4E0A\u6E38/ahead-behind\uFF0Cfetch\uFF08\u53EF prune\uFF09\u3001ff-only pull\u3001\u786E\u8BA4\u540E\u624D push\u3002\u4E0D\u66FF\u6362\u5185\u7F6E Git \u7684\u6682\u5B58/\u63D0\u4EA4\uFF0C\u4E5F\u4E0D\u63D0\u4F9B force-push \u6216\u6A21\u578B\u81EA\u52A8\u63A8\u9001",
  pluginSentinelDesc: "\u6761\u4EF6\u9A71\u52A8\u7684 agent \u5524\u9192\u7CFB\u7EDF\uFF1A\u6587\u4EF6/\u8FDB\u7A0B/\u7AEF\u53E3/HTTP/\u547D\u4EE4/webhook \u4F20\u611F\u5668\uFF0C\u6761\u4EF6\u8FBE\u6210\u81EA\u52A8\u5524\u9192\u4F11\u7720\u4F1A\u8BDD\uFF1B\u6CE8\u518C\u300C\u54E8\u5175\u300DTab \u5C55\u793A\u670D\u52A1\u5668\u5168\u5C40\u76D1\u63A7\u8868",
  pluginSidebarQaDesc: "\u57FA\u4E8E better-sidebar \u7684\u5212\u9009\u63D0\u95EEtab\u5206\u9875: \u5BF9\u8BDD\u5212\u9009 \u2192 \u53F3\u4FA7\u9762\u677F\u63D0\u95EE \u2192 \u540C\u5DE5\u4F5C\u533A\u72EC\u7ACB\u8FFD\u95EE\u4F1A\u8BDD\uFF08\u2753\u8FFD\u95EE\xB7\u4E3B\u9898\uFF09\uFF1A\u5FEB\u901F\u65E0\u601D\u8003\u6A21\u578B\u538B\u7F29\u4E3B\u5BF9\u8BDD\u4E0A\u4E0B\u6587\u540E\u4E0E\u5F15\u6587\u4E00\u8D77\u6CE8\u5165\uFF0C\u4E0D\u6253\u65AD\u4E3B\u5BF9\u8BDD\uFF1B\u8FFD\u95EE\u53EF\u5D4C\u5957\u3001\u53EF\u7EE7\u7EED\u3001\u53EF\u5F52\u6863",
  pluginVideoPreviewDesc: "\u5728 better-sidebar \u7F16\u8F91\u5668\u5185\u8054\u9884\u89C8\u89C6\u9891\u6587\u4EF6\uFF08.mp4/.webm/.mov/.mkv/.avi \u7B49\uFF09\uFF0C\u81EA\u5E26\u652F\u6301 HTTP Range\uFF08206\uFF09\u7684 /video \u5BBF\u4E3B\u8DEF\u7531\uFF0C\u53EF\u62D6\u52A8\u8FDB\u5EA6\u6761\u3001\u4E0D\u53D7 20MB mediaLimit \u9650\u5236"
};
var en = {
  files: "Files",
  explorer: "Explorer",
  git: "Source Control",
  terminal: "Terminal",
  editor: "Editor",
  editorExplorer: "File open behavior",
  editorExplorerDesc: "Controls how files open",
  editorExplorerMerged: "Merged",
  editorExplorerMergedDesc: "Files switch in place in the same window; new windows start with the tree open",
  editorExplorerSplit: "Separate",
  editorExplorerSplitDesc: "Path-less windows are the standalone explorer (tree only); each file opens its own window (tree docked, closed by default)",
  editorTreeToggle: "File tree panel",
  editorPathPlaceholder: "File path (relative to the session directory or absolute), Enter to open",
  editorSearchPlaceholder: "Search files by name\u2026",
  editorSearchNoResults: "No matching files",
  editorSearchTruncated: "Too many results \u2014 showing a partial list",
  editorEmptyHint: "Pick a file from the tree panel or the path input above to start previewing",
  openFileNewTab: "Open in New Tab",
  openFileSide: "Open to the Side",
  newTab: "New tab",
  openExplorer: "Explorer",
  brokenSymlink: "Broken symlink",
  openGit: "Git panel",
  newTerminal: "New terminal",
  terminalLimit: "Terminal limit reached (3)",
  close: "Close",
  collapse: "Collapse sidebar",
  expand: "Expand sidebar",
  collapseBottomPanel: "Collapse bottom panel",
  expandBottomPanel: "Expand bottom panel",
  swapPanelSide: "Swap conversation and sidebar",
  terminalError: "Terminal connection failed",
  terminalConnectFailed: "Terminal failed to connect repeatedly",
  terminalRetry: "Retry",
  terminalDepsFailed: "Terminal dependency node-pty failed to load",
  terminalDepsHint: "Run the command below in a terminal or cmd on the DSH machine to repair it, then retry (node-pty stays in sync with the DSH core version):",
  terminalDepsProfile: " (detected profile: {profile})",
  preview: "Preview",
  edit: "Edit",
  mermaidError: "Mermaid render failed",
  mermaidZoomIn: "Zoom in",
  mermaidZoomOut: "Zoom out",
  mermaidZoomReset: "Reset",
  mermaidZoomHint: "Scroll to zoom \xB7 drag to pan \xB7 Esc to close",
  refresh: "Refresh",
  save: "Save",
  saved: "Saved",
  unsaved: "Unsaved",
  saveFailed: "Save failed",
  truncation: "File too large \u2014 showing the first 512KB",
  binary: "Binary file, preview unavailable",
  loading: "Loading\u2026",
  error: "Failed to load",
  retry: "Retry",
  splitLeft: "Split left",
  splitRight: "Split right",
  splitUp: "Split up",
  splitDown: "Split down",
  notRepo: "This directory is not a git repository",
  noChanges: "No changes",
  stage: "Stage",
  unstage: "Unstage",
  stageAll: "Stage all",
  unstageAll: "Unstage all",
  commitPlaceholder: "Commit message (Ctrl+Enter)",
  commit: "Commit",
  commitError: "Commit failed",
  branch: "Branch",
  checkoutError: "Branch switch failed",
  history: "History",
  changes: "Changes",
  staged: "Staged",
  unstaged: "Unstaged",
  cancel: "Cancel",
  diffEmpty: "No text changes",
  diffLoadError: "Failed to load diff",
  diffBinary: "Binary",
  diffAdded: "Added",
  diffDeleted: "Deleted",
  diffRenamed: "Renamed",
  diffExpand: "Expand {count} more rows",
  diffCollapse: "Collapse",
  discard: "Discard changes",
  discardTitle: "Discard changes",
  discardDesc: 'This discards the worktree changes of "{path}" (not recoverable).',
  viewCommitDiff: "View commit diff",
  copyShortHash: "Copy short hash",
  copyFullHash: "Copy full hash",
  copySubject: "Copy subject",
  revertCommit: "Revert commit",
  revertTitle: "Revert commit",
  revertDesc: 'Create a new commit on the current branch that reverts "{subject}".',
  cherryPickCommit: "Cherry-pick commit",
  cherryPickTitle: "Cherry-pick commit",
  cherryPickDesc: 'Apply the changes of "{subject}" to the current branch.',
  timeJustNow: "just now",
  timeMinutesAgo: "{n} min ago",
  timeHoursAgo: "{n} h ago",
  timeYesterday: "yesterday",
  loadMore: "Load more",
  historyLoadError: "Failed to load more history",
  produced: "Produced",
  producedOpen: "Open in sidebar",
  disconnected: "Terminal disconnected, reconnecting\u2026",
  exited: "Terminal process exited",
  noSession: "Select a conversation to use the sidebar",
  pluginNotLoaded: "Plugin not loaded; tab unavailable:",
  hiddenFiles: "Hidden files",
  parent: "Parent directory",
  copied: "Copied",
  copy: "Copy",
  newFile: "New file",
  openEditor: "Open editor",
  gitDetail: "View change details",
  referenceFile: "@file",
  addToConversation: "Add to conversation",
  copyRelative: "Copy relative path",
  copyAbsolute: "Copy absolute path",
  download: "Download",
  settingsNav: "Side card",
  settingsIntro: "Manage what the side card shows and how it behaves",
  settingsPopupDesc: "Configure related options for {feature}",
  settingsDone: "Done",
  settingsOpenTitle: "Open by default for new conversations",
  settingsOpenDesc: "Expand the side card automatically for brand-new conversations; existing conversations keep their own layouts",
  settingsWidthTitle: "Default width share",
  settingsWidthDesc: "The side card's default share of the window width for new conversations (20\u201360)",
  settingsWidthSuffix: "%",
  settingsOpenPathTitle: "Open chat files in the sidebar",
  settingsOpenPathDesc: "Open file links in the chat (tool rows, produced files, mentions) in the sidebar editor instead of the system default app",
  settingsTitleBarTitle: "Position compatibility mode",
  settingsTitleBarDesc: "Reserve space for the native Windows title bar at the top-right so the sidebar buttons and content sit below it instead of underneath",
  settingsTitleBarStripTitle: "Shift distance",
  settingsTitleBarStripDesc: "Title-bar strip height: how far the sidebar buttons and content move down in px (0\u2013120, default 40)",
  settingsSaveFailed: "Failed to save",
  settingsConflict: "The setting changed in another window \u2014 please retry",
  binaryNoPreview: "This file type cannot be previewed",
  downloadToView: "Download to view",
  settingsSubagentTitle: "Auto-open the Tasks page when a subagent appears",
  settingsSubagentDesc: "Expand the side card and open the Tasks page when the current conversation spawns a new subagent; turn off to open it manually",
  settingsJobsTitle: "Auto-open the Jobs page on a new background job",
  settingsJobsDesc: "Expand the side card and open the Jobs page whenever a new background job appears for the current conversation (every new job triggers); turn off to open it manually",
  settingsToolsTitle: "Inject terminal tools for the model",
  settingsToolsDesc: "When enabled, the model can create and drive sidebar terminals through the 8 terminal_* tools (off by default)",
  settingsBottomTerminalTitle: "Auto-open a terminal on the bottom panel's first expansion",
  settingsBottomTerminalDesc: "When the bottom panel is expanded for the first time in a session, try to open a fresh terminal tab there (the terminal quota still applies; on by default)",
  settingsFontFamilyTitle: "Terminal font family",
  settingsFontFamilyDesc: `Custom terminal font family (a CSS font-family stack like "JetBrains Mono", monospace; leave empty to follow the theme's monospace font)`,
  settingsFontFamilyPlaceholder: '"JetBrains Mono", monospace',
  settingsFontSizeTitle: "Terminal font size",
  settingsFontSizeDesc: "Terminal font size in px (9\u201332, default 13)",
  settingsFontSizeSuffix: "px",
  settingsTabsTitle: "Sidebar content",
  settingsViewersTitle: "File viewers",
  settingsGeneralTitle: "General",
  settingsPopup: "Feature settings",
  settingsViewerCatchAll: "Catch-all: any file",
  viewerImage: "Image",
  viewerPdf: "PDF",
  viewerMarkdown: "Markdown",
  viewerCode: "Code",
  viewerBinary: "Binary download",
  viewerHtml: "HTML",
  browser: "Browser",
  browserPlaceholder: "Enter a URL, e.g. example.com",
  browserGo: "Go",
  browserBack: "Back",
  browserForward: "Forward",
  browserStart: "Enter a URL to start browsing (sandbox mode)",
  browserBlockedScheme: "Blocked: only http/https URLs are allowed",
  browserBlockedLoopback: "Blocked: local and internal addresses cannot be browsed here",
  browserInvalid: "Invalid URL",
  browserNoSandboxWarning: "Sandbox off: the current page runs with full GUI privileges (re-enable in settings)",
  htmlNoSandboxWarning: "Sandbox off: this HTML runs with full GUI privileges (re-enable in settings)",
  sandboxStatusOn: "Sandbox mode: on \xB7 pages cannot access the GUI's data or local files; logins and third-party cookies may not work",
  sandboxUnlock: "Temporarily disable (unsafe)",
  sandboxRestore: "Restore sandbox",
  settingsHtmlDefaultUnsafeTitle: "Open HTML previews unsandboxed by default (unsafe)",
  settingsHtmlDefaultUnsafeDesc: "When on, every newly opened HTML preview starts in the unsandboxed state (same origin as the GUI \u2014 it can read session files and internal APIs); the status row still offers a one-tap restore",
  settingsHtmlSandboxTitle: "Disable HTML preview sandbox (unsafe)",
  settingsHtmlSandboxDesc: "With the sandbox off, previewed HTML runs with the same origin as the GUI: it can read session files, local storage and call internal APIs. Only enable for fully trusted files",
  settingsBrowserSandboxTitle: "Disable browser sandbox (unsafe)",
  settingsBrowserSandboxDesc: "With the sandbox off, any visited site runs with the same origin as the GUI: it can read session data and act as your logged-in session. Only enable for fully trusted sites",
  settingsBrowserLinksTitle: "Open chat external links in the sidebar",
  settingsBrowserLinksDesc: "When on, clicking an external link in the chat or GUI opens the sidebar instead of a new window; HTTP and HTTPS are controlled separately by the switches below; Ctrl/Cmd+click always bypasses",
  settingsBrowserHttpTitle: "Open HTTP pages in the sidebar",
  settingsBrowserHttpDesc: "When on, clicking an HTTP external link in the chat or GUI opens the sidebar (plugin pages declaring urlTarget win); Ctrl/Cmd+click always bypasses",
  settingsBrowserHttpsTitle: "Open HTTPS pages in the sidebar",
  settingsBrowserHttpsDesc: "When on, clicking an HTTPS external link in the chat or GUI opens the sidebar. Off by default: most HTTPS sites refuse to be embedded, so the system browser is the smoother default",
  browserOpenExternal: "Open in browser",
  browserEmbedBlocked: "{host} refused to be embedded",
  browserEmbedBlockedDesc: "The site forbids being displayed inside other pages (X-Frame-Options / frame-ancestors), so it cannot load in the sidebar. Open it directly in your browser instead.",
  browserEmbedAnyway: "Load anyway",
  browserBridgeOpen: "Open in Chrome",
  browserBridgeUnavailable: "Chrome browser bridge is not connected",
  browserBridgeConnected: "Chrome tab connected",
  browserDesktopOpened: "Opened in the desktop Browser panel",
  subagent: "Tasks",
  openSubagent: "Tasks",
  subagentMainAgent: "Main agent",
  subagentEmpty: "No subagents",
  subagentEmptyDesc: "Subagents spawned under the main agent will appear here",
  subagentRunning: "Running",
  subagentInactive: "Inactive",
  subagentModeOneShot: "One-shot",
  subagentModeContinuable: "Continuable",
  subagentCount: "{count} subagents",
  subagentCountRunning: "{count} subagents \xB7 {running} running",
  subagentDiagCorrupt: "Corrupt",
  subagentDiagUnsupported: "Unsupported",
  subagentDiagUnavailable: "Unavailable",
  subagentThinking: "Thinking\u2026",
  jobs: "Background jobs",
  jobsCount: "{count} background jobs",
  jobsCountRunning: "{count} background jobs \xB7 {running} running",
  jobStatusRunning: "Running",
  jobStatusStopping: "Stopping",
  jobStatusCompleted: "Completed",
  jobStatusKilled: "Killed",
  jobStatusFailed: "Failed",
  jobDurationSeconds: "{seconds}s",
  jobDurationMinutes: "{minutes}m {seconds}s",
  jobDurationHours: "{hours}h {minutes}m",
  jobViewOutput: "View output",
  jobHideOutput: "Hide output",
  jobNoOutput: "No output yet",
  jobNotReadYet: "Waiting for the model to read this job; its output appears here once the model runs job_output",
  jobOutputTruncated: "Output truncated",
  jobOutputError: "Failed to read output",
  jobKill: "Kill",
  jobKillConfirm: "Click again to confirm kill",
  jobKillError: "Kill failed",
  addPluginsTabCard: "Add tab plugins",
  addPluginsTabCardDesc: "Register a new sidebar page",
  addPluginsViewerCard: "Add preview plugins",
  addPluginsViewerCardDesc: "Register a file-type preview",
  addPluginsTabDesc: "Sidebar pages (tabs) can be extended by plugins. Plugins register through the ctx.betterSidebar service; clicking Install copies the install command \u2014 paste it into a terminal where your DSH profile lives and run it.",
  addPluginsViewerDesc: "File previewers can be extended by plugins. Plugins register through the ctx.betterSidebar service; clicking Install copies the install command \u2014 paste it into a terminal where your DSH profile lives and run it.",
  addPluginsBrowseMore: "Browse more plugins on GitHub (topic: dsh-better-sidebar)",
  addPluginsRecommended: "Recommended plugins",
  addPluginsEmpty: "No plugins curated yet \u2014 publish yours under the GitHub topic",
  openPlugin: "Open",
  copyInstall: "Copy install command",
  pluginOfficeDesc: "Office-suite preview (.docx / .xlsx / .pptx) for the better-sidebar editor, keeping the heavy Office render libraries out of the core bundle",
  pluginGitRemotesDesc: "Git Remotes tab: branch/upstream/ahead-behind, fetch (optional prune), ff-only pull, and push only after an in-tab confirm. Does not replace the built-in Git stage/commit tab, and does not offer force-push or a model auto-push tool",
  pluginSentinelDesc: 'Condition-driven agent wakeup: file/process/port/http/command/webhook sensors wake dormant sessions when conditions fire; registers a "Sentinel" tab with the server-wide watch table',
  pluginSidebarQaDesc: "Select-and-ask: Select conversation text \u2192 ask in the right-side panel \u2192 a dedicated follow-up session (\u2753\u8FFD\u95EE) in the same workspace; a fast no-thinking model compresses the main context and injects it with the quote, without interrupting the main conversation. Follow-ups nest, continue, and archive",
  pluginVideoPreviewDesc: "Inline video preview (.mp4/.webm/.mov/.mkv/.avi etc.) for the better-sidebar editor, backed by a dedicated /video host route with HTTP Range (206) support \u2014 scrubbing works and files are not capped by the 20MB mediaLimit"
};
var LOCALE_NS = "betterSidebar";
var localeService;
function attachLocale(service) {
  localeService = service;
}
function activeLocale() {
  return localeService?.getSnapshot().active ?? (typeof navigator !== "undefined" ? navigator.language : "") ?? "en";
}
function t(key, params) {
  const dict = activeLocale().toLowerCase().startsWith("zh") ? zh : en;
  let text = dict[key];
  if (params !== void 0) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
function relativeTime(iso) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const seconds = Math.floor((Date.now() - then) / 1e3);
  if (seconds < 60) return t("timeJustNow");
  if (seconds < 3600) return t("timeMinutesAgo", { n: Math.floor(seconds / 60) });
  if (seconds < 86400) return t("timeHoursAgo", { n: Math.floor(seconds / 3600) });
  if (seconds < 172800) return t("timeYesterday");
  const date = new Date(then);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// src/client/intercept.tsx
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/paths.ts
function isAbsolutePath(path) {
  return path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || /^[\\/]{2}[^\\/]/.test(path);
}
function relativeTo(cwd, path) {
  const base = cwd.replace(/[\\/]+$/, "");
  const norm = (value) => value.replace(/\\/g, "/");
  const nBase = norm(base);
  const nPath = norm(path);
  if (nPath === nBase) return ".";
  if (nPath.toLowerCase().startsWith(`${nBase.toLowerCase()}/`)) return nPath.slice(nBase.length + 1);
  return path;
}

// src/client/produced-files.ts
function producedPaths(view) {
  if (view === null || typeof view !== "object") return [];
  const record = view;
  const isEdit = record.card === "diff" || record.card === "generic" && record.kind === "edit";
  if (!isEdit) return [];
  if (!Array.isArray(record.locations)) return [];
  const paths = [];
  for (const location2 of record.locations) {
    if (location2 !== null && typeof location2 === "object" && typeof location2.path === "string") {
      paths.push(location2.path);
    }
  }
  return paths;
}
function producedForClosing(nodes, seq) {
  let pending = [];
  let seen = /* @__PURE__ */ new Set();
  let turn;
  for (const node of nodes) {
    if (node === null || typeof node !== "object") continue;
    const record = node;
    if (record.kind === "tool-result") {
      if (record.isError === true) continue;
      for (const path of producedPaths(record.callView)) {
        if (seen.has(path)) continue;
        seen.add(path);
        pending.push(path);
      }
      continue;
    }
    if (record.kind === "user") {
      turn = void 0;
      pending = [];
      seen = /* @__PURE__ */ new Set();
    } else if (typeof record.turn === "number") {
      if (turn !== void 0 && record.turn !== turn) {
        pending = [];
        seen = /* @__PURE__ */ new Set();
      }
      turn = record.turn;
    }
    if (record.kind === "assistant" && record.seq === seq) return pending;
  }
  return [];
}
function selectProducedFiles(owner) {
  const record = owner;
  if (record === null || typeof record !== "object") return null;
  if (!Array.isArray(record.nodes) || typeof record.seq !== "number") return null;
  const paths = producedForClosing(record.nodes, record.seq);
  return paths.length === 0 ? null : paths;
}
function resolveSidebarPath(cwd, path) {
  if (isAbsolutePath(path)) return path;
  const base = cwd ?? "";
  if (base === "") return path;
  const separator = base.includes("\\") ? "\\" : "/";
  return `${base.replace(/[\\/]+$/, "")}${separator}${path}`;
}

// src/client/openpath-intercept.ts
function wrapOpenPath(workspaces, deps) {
  const original = workspaces.openPath;
  workspaces.openPath = (path) => {
    if (deps.takeoverEnabled()) {
      const sessionId = deps.currentSessionId();
      if (sessionId !== void 0) {
        deps.openInSidebar(path, sessionId);
        return Promise.resolve();
      }
    }
    return original.call(workspaces, path);
  };
  return () => {
    workspaces.openPath = original;
  };
}

// dshinline: dsh-inline:D%3A%5C%E5%B7%A5%E4%BD%9C%5CAI%E6%96%87%E4%BB%B6%5Cdeepseek%20harness%5Cdsh-better-sidebar%5Csrc%5Cclient%5Csidebar.module.css.mjs
var css = '.Lw7UvW_toggleCluster{z-index:45;flex-direction:row;gap:4px;display:flex;position:fixed;top:3px;right:10px}.Lw7UvW_toggleCluster[data-side=left]{right:auto;left:calc(var(--dsh-sidebar-shell-left,0px) + var(--dsh-sidebar-panel-width,0px) - 98px)}.Lw7UvW_panel:not(.Lw7UvW_panelHidden) .Lw7UvW_tabBar{padding-right:104px}.Lw7UvW_toggleButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background var(--ds-transition-duration-slow) var(--ds-ease-in-out), color var(--ds-transition-duration-slow) var(--ds-ease-in-out);background:0 0;border:none;border-radius:50%;justify-content:center;align-items:center;display:flex}.Lw7UvW_toggleButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_toggleButton:disabled{opacity:.4;cursor:default}.Lw7UvW_panel{z-index:40;background:var(--dsw-alias-bg-layer-1);border-left:1px solid var(--dsw-alias-border-l2);transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out), width var(--ds-transition-duration-slow) var(--ds-ease-in-out);flex-direction:column;display:flex;position:fixed;top:0;bottom:0;right:0}.Lw7UvW_panel[data-side=left]{border-left:none;border-right:1px solid var(--dsw-alias-border-l2);right:auto}.Lw7UvW_panel[data-side=left].Lw7UvW_panelHidden{transform:translate(-102%)}.Lw7UvW_panelHidden{pointer-events:none;visibility:hidden;transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out), width var(--ds-transition-duration-slow) var(--ds-ease-in-out), visibility 0s linear var(--ds-transition-duration-slow);transform:translate(102%)}.Lw7UvW_panel[data-dragging]{transition:none}.Lw7UvW_panelResize{cursor:col-resize;z-index:2;touch-action:none;width:8px;position:absolute;top:0;bottom:0;left:-4px}.Lw7UvW_panel[data-side=left] .Lw7UvW_panelResize{cursor:col-resize;left:auto;right:-4px}.Lw7UvW_panelResizeActive{background:var(--dsw-alias-interactive-bg-hover-accent)}.Lw7UvW_panelBody{flex:1;min-width:0;min-height:0;display:flex}.Lw7UvW_bottomPanel{z-index:40;background:var(--dsw-alias-bg-layer-1);border-top:1px solid var(--dsw-alias-border-l2);transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out), height var(--ds-transition-duration-slow) var(--ds-ease-in-out);flex-direction:column;display:flex;position:fixed;bottom:0}.Lw7UvW_bottomPanelHidden{pointer-events:none;visibility:hidden;transition:transform var(--ds-transition-duration-slow) var(--ds-ease-in-out), height var(--ds-transition-duration-slow) var(--ds-ease-in-out), visibility 0s linear var(--ds-transition-duration-slow);transform:translateY(102%)}.Lw7UvW_bottomPanel[data-dragging]{transition:none}.Lw7UvW_bottomResize{cursor:row-resize;z-index:2;touch-action:none;height:8px;position:absolute;top:-4px;left:0;right:0}.Lw7UvW_bottomResizeActive{background:var(--dsw-alias-interactive-bg-hover-accent)}.Lw7UvW_bottomClose{z-index:4;width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;position:absolute;top:3px;right:6px}.Lw7UvW_bottomClose:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_bottomPanel .Lw7UvW_tabBar{padding-right:40px}body[data-dsh-title-bar-compat] .Lw7UvW_toggleCluster{top:calc(var(--dsh-title-bar-strip,40px) + 3px)}body[data-dsh-title-bar-compat] .Lw7UvW_panel{padding-top:var(--dsh-title-bar-strip,40px)}.Lw7UvW_cornerHandle{left:-6px;bottom:calc(var(--dsh-sidebar-height,0px) + 6px);z-index:2;cursor:nwse-resize;touch-action:none;width:12px;height:12px;position:absolute}.Lw7UvW_panel[data-side=left] .Lw7UvW_cornerHandle{cursor:nesw-resize;left:auto;right:-6px}.Lw7UvW_cornerHandle:hover,.Lw7UvW_cornerHandle[data-dragging]{background:var(--dsw-alias-interactive-bg-hover-accent)}.Lw7UvW_iconButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.Lw7UvW_iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_iconButton:disabled{opacity:.4;cursor:default}.Lw7UvW_workbench,.Lw7UvW_split{flex:1;min-width:0;min-height:0;display:flex}.Lw7UvW_splitRow{flex-direction:row}.Lw7UvW_splitCol{flex-direction:column}.Lw7UvW_splitChild{display:flex;position:relative;overflow:hidden}.Lw7UvW_divider{z-index:3;touch-action:none;flex:none;position:relative}.Lw7UvW_dividerRow:after,.Lw7UvW_dividerCol:after{content:"";background:var(--dsw-alias-border-l2);transition:background var(--ds-transition-duration-slow) var(--ds-ease-in-out);position:absolute}.Lw7UvW_dividerRow{cursor:col-resize;width:7px;margin:0 -2px}.Lw7UvW_dividerRow:after{width:1px;top:0;bottom:0;left:50%;transform:translate(-50%)}.Lw7UvW_dividerCol{cursor:row-resize;height:7px;margin:-2px 0}.Lw7UvW_dividerCol:after{height:1px;top:50%;left:0;right:0;transform:translateY(-50%)}.Lw7UvW_divider:hover:after,.Lw7UvW_dividerActive:after{background:var(--dsw-alias-interactive-bg-hover-accent)}.Lw7UvW_pane{background:var(--dsw-alias-bg-base);flex-direction:column;flex:1;min-width:0;min-height:0;display:flex;position:relative}.Lw7UvW_paneDrop{outline:1px solid var(--dsw-alias-interactive-bg-hover-accent);outline-offset:-1px}.Lw7UvW_dropOverlay{z-index:6;pointer-events:none;background:var(--dsw-alias-interactive-bg-hover-accent);opacity:.5;position:absolute}.Lw7UvW_dropLeft{width:25%;top:0;bottom:0;left:0}.Lw7UvW_dropRight{width:25%;top:0;bottom:0;right:0}.Lw7UvW_dropUp{height:25%;top:0;left:0;right:0}.Lw7UvW_dropDown{height:25%;bottom:0;left:0;right:0}.Lw7UvW_dropCenter{outline:2px dashed var(--dsw-alias-interactive-bg-hover-accent);outline-offset:-2px;background:0 0;inset:25%}.Lw7UvW_paneContent{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden}.Lw7UvW_paneTab{flex-direction:column;flex:1;min-height:0;display:flex}.Lw7UvW_paneTabHidden{display:none}.Lw7UvW_paneEmptyCards{flex:1;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));align-content:start;gap:8px;min-height:0;padding:12px;display:grid;overflow:hidden}.Lw7UvW_paneCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-strong-12);cursor:pointer;text-align:center;border-radius:8px;flex-direction:column;justify-content:center;align-items:center;gap:6px;padding:12px 8px;display:flex}.Lw7UvW_paneCard:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}.Lw7UvW_paneCard:disabled{opacity:.45;cursor:default}.Lw7UvW_tabBar{border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none;align-items:stretch;height:34px;display:flex}.Lw7UvW_tabBarDrop{outline:1px dashed var(--dsw-alias-interactive-bg-hover-accent);outline-offset:-1px}.Lw7UvW_tabList{scrollbar-width:none;flex:1;min-width:0;display:flex;overflow-x:auto}.Lw7UvW_tabList::-webkit-scrollbar{display:none}.Lw7UvW_tab{min-width:64px;max-width:160px;font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-secondary);border-right:1px solid var(--dsw-alias-border-l1);cursor:pointer;user-select:none;background:0 0;flex:none;align-items:center;gap:4px;padding:0 4px 0 10px;display:flex}.Lw7UvW_tab:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_tabActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active)}.Lw7UvW_tabTitle{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.Lw7UvW_tabBadge{min-width:16px;height:15px;font:var(--dsw-font-xxxs-strong-11);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-brand-primary);border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0 4px;display:inline-flex}.Lw7UvW_tabClose{width:18px;height:18px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.Lw7UvW_tabClose:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_tabBarPlus{background:var(--dsw-alias-bg-layer-1);width:22px;height:22px;color:var(--dsw-alias-label-tertiary);cursor:pointer;border:none;border-radius:5px;flex:none;justify-content:center;align-self:center;align-items:center;margin:0 6px;padding:0;display:inline-flex;position:sticky;right:0}.Lw7UvW_tabBarPlus:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_explorer{flex-direction:column;flex:1;min-height:0;display:flex}.Lw7UvW_explorerHeader{flex:none;justify-content:space-between;align-items:center;gap:8px;height:36px;padding:0 8px 0 12px;display:flex}.Lw7UvW_explorerRoot{font:var(--dsw-font-s-14);color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.Lw7UvW_explorerBody{flex:1;min-height:0;padding:2px 6px 8px;overflow:hidden auto}.Lw7UvW_explorerRow{box-sizing:border-box;width:100%;max-width:100%;height:34px;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;white-space:nowrap;animation:Lw7UvW_dsh-row-in .15s var(--ds-ease-in-out);background:0 0;border:none;border-radius:8px;align-items:center;gap:6px;padding:0 8px;display:flex}.Lw7UvW_explorerRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_explorerDir{font:var(--dsw-font-s-strong-14)}.Lw7UvW_explorerHidden{opacity:.45}.Lw7UvW_explorerSymlink{color:var(--dsw-alias-label-tertiary);flex:none}.Lw7UvW_explorerBroken .Lw7UvW_explorerName{color:var(--dsw-alias-state-error-primary)}.Lw7UvW_explorerName{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.Lw7UvW_explorerRef{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);height:20px;color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxxs-strong-11);cursor:pointer;border-radius:999px;flex:none;align-items:center;padding:0 8px;display:none}.Lw7UvW_explorerRef:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_explorerRow:hover .Lw7UvW_explorerRef,.Lw7UvW_explorerRow:focus-within .Lw7UvW_explorerRef{display:inline-flex}.Lw7UvW_explorerCopied{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);flex:none}.Lw7UvW_explorerError{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);cursor:default}@keyframes Lw7UvW_dsh-row-in{0%{opacity:0}}.Lw7UvW_explorerEmpty{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);text-align:center;padding:16px}.Lw7UvW_editor{flex-direction:column;flex:1;min-height:0;display:flex}.Lw7UvW_editorHeader{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:center;gap:6px;padding:4px 8px;display:flex}.Lw7UvW_editorTitle{min-width:0;font:var(--dsw-font-xxs-strong-12);color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.Lw7UvW_editorPathInput{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0;height:28px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);border-radius:6px;flex:1;padding:0 10px}.Lw7UvW_editorPathInput:focus{border-color:var(--dsw-alias-border-l2);outline:none}.Lw7UvW_editorTreeToggleActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active)}.Lw7UvW_editorBody{flex:1;min-height:0;display:flex}.Lw7UvW_editorMain{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.Lw7UvW_editorTreeDock{border-left:1px solid var(--dsw-alias-border-l1);flex:none;min-height:0;display:flex;position:relative}.Lw7UvW_editorTreeResize{cursor:col-resize;touch-action:none;z-index:3;width:6px;position:absolute;top:0;bottom:0;left:0}.Lw7UvW_editorTreeResize:hover{background:var(--dsw-alias-border-l2)}.Lw7UvW_editorTreePanel{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.Lw7UvW_editorTreePanelFull{flex:1}.Lw7UvW_editorTreeSearch{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:center;gap:4px;padding:6px 8px;display:flex}.Lw7UvW_editorSearchInput{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0;height:26px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);border-radius:6px;flex:1;padding:0 10px}.Lw7UvW_editorSearchInput:focus{border-color:var(--dsw-alias-border-l2);outline:none}.Lw7UvW_editorSearchHint{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);padding:8px 12px}.Lw7UvW_editorSearchResult{width:100%;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);text-align:left;cursor:pointer;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:none;border-radius:6px;padding:4px 8px;display:block;overflow:hidden}.Lw7UvW_editorSearchResult:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_editorStatus{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_editorStatusError{color:var(--dsw-alias-state-error-primary)}.Lw7UvW_dirtyDot{background:var(--dsw-alias-state-warn-primary);border-radius:50%;flex:none;width:7px;height:7px}.Lw7UvW_editorPlaceholder{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);text-align:center;flex:1;justify-content:center;align-items:center;padding:16px;display:flex}.Lw7UvW_orphanedType{opacity:.7;overflow-wrap:anywhere;margin-top:8px;font-size:12px;display:block}.Lw7UvW_editorBinary{text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;gap:12px;padding:24px 16px;display:flex}.Lw7UvW_editorBinaryNotice{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_editorDownloadLink{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-strong-12);cursor:pointer;transition:background var(--ds-transition-duration-slow) var(--ds-ease-in-out), border-color var(--ds-transition-duration-slow) var(--ds-ease-in-out);border-radius:6px;align-items:center;gap:6px;padding:6px 14px;text-decoration:none;display:inline-flex}.Lw7UvW_editorDownloadLink:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}.Lw7UvW_editorError{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);padding:12px 16px}.Lw7UvW_editorBanner{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary);flex:none;padding:4px 12px}.Lw7UvW_sandboxStatus{font:var(--dsw-font-xxxs-11);flex:none;align-items:center;gap:8px;padding:4px 10px;display:flex}.Lw7UvW_sandboxStatusOn{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}.Lw7UvW_sandboxStatusOff{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent)}.Lw7UvW_sandboxDot{background:var(--dsw-alias-state-success-primary);border-radius:50%;flex:none;width:6px;height:6px}.Lw7UvW_sandboxStatusOff .Lw7UvW_sandboxDot{background:var(--dsw-alias-state-error-primary)}.Lw7UvW_sandboxStatusText{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.Lw7UvW_sandboxAction{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:inherit;cursor:pointer;background:0 0;border-radius:6px;flex:none;padding:2px 8px}.Lw7UvW_sandboxAction:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_editorHtml{background:var(--dsw-alias-bg-base);border:none;flex:1;width:100%;min-height:0}.Lw7UvW_browser{flex-direction:column;flex:1;min-height:0;display:flex}.Lw7UvW_browserBar{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:center;gap:4px;padding:6px 8px;display:flex}.Lw7UvW_browserInput{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0;height:28px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);border-radius:6px;flex:1;padding:0 10px}.Lw7UvW_browserInput:focus{border-color:var(--dsw-alias-border-l2);outline:none}.Lw7UvW_browserZoom{flex:none;align-items:center;gap:2px;display:flex}.Lw7UvW_browserZoomValue{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:44px;height:24px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);text-align:center;cursor:pointer;border-radius:5px;padding:0 4px}.Lw7UvW_browserZoomValue:hover{border-color:var(--dsw-alias-border-l2)}.Lw7UvW_browserMessage{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary);flex:none;padding:4px 12px}.Lw7UvW_browserFrame{background:var(--dsw-alias-bg-base);border:none;flex:1;width:100%;min-height:0}.Lw7UvW_browserWebview{background:#fff;flex:1;width:100%;min-height:0;position:relative;overflow:hidden}.Lw7UvW_browserStart{text-align:center;min-height:0;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);flex:1;justify-content:center;align-items:center;padding:20px;display:flex}.Lw7UvW_browserBlocked{text-align:center;min-height:0;color:var(--dsw-alias-state-warn-primary);flex-direction:column;flex:1;justify-content:center;align-items:center;gap:6px;padding:24px;display:flex}.Lw7UvW_browserBlockedTitle{font:var(--dsw-font-xxs-strong-12);color:var(--dsw-alias-label-primary)}.Lw7UvW_browserBlockedDesc{max-width:280px;font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-secondary)}.Lw7UvW_browserBlockedActions{gap:8px;margin-top:6px;display:flex}.Lw7UvW_browserBlockedButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxxs-11);cursor:pointer;border-radius:6px;padding:4px 12px}.Lw7UvW_browserBlockedButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_editorCm{background:0 0;flex:1;min-height:0;overflow:hidden}.Lw7UvW_editorCmHidden{display:none}.Lw7UvW_editorCm .cm-editor{height:100%}.Lw7UvW_editorCm .cm-editor.cm-focused{outline:none}.Lw7UvW_editorModeToggle{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:6px;flex:none;align-items:center;gap:2px;padding:2px;display:inline-flex}.Lw7UvW_editorModeButton{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxxs-11);cursor:pointer;background:0 0;border:none;border-radius:4px;padding:2px 8px}.Lw7UvW_editorModeButton:hover{color:var(--dsw-alias-label-primary)}.Lw7UvW_editorModeActive{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}.Lw7UvW_editorImageWrap{flex:1;justify-content:center;align-items:center;min-height:0;padding:12px;display:flex;overflow:auto}.Lw7UvW_editorImage{object-fit:contain;max-width:100%;max-height:100%}.Lw7UvW_editorMd{min-height:0;font:var(--dsw-font-xs-13);flex:1;padding:10px 14px;overflow-y:auto}.Lw7UvW_mermaidWrap{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:6px;margin:6px 0;overflow:hidden}.Lw7UvW_mermaidHeader{border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);justify-content:space-between;align-items:center;gap:6px;padding:4px 8px;display:flex}.Lw7UvW_mermaidInfo{font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_mermaidCopy{height:20px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxxs-11);cursor:pointer;background:0 0;border:none;border-radius:4px;align-items:center;gap:4px;padding:0 6px;display:inline-flex}.Lw7UvW_mermaidCopy:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_mermaidBody{cursor:zoom-in;justify-content:center;padding:10px;display:flex;overflow:auto}.Lw7UvW_mermaidBody svg{max-width:100%;height:auto}.Lw7UvW_mermaidError{border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xxxs-11);padding:6px 10px}.Lw7UvW_mermaidCode{font:var(--dsw-font-xxxs-11);margin:0;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto}.Lw7UvW_mermaidMarkdown .md-code-block[data-mermaid-processed]{display:contents}.Lw7UvW_mermaidModal{z-index:1000;background:var(--dsw-alias-bg-mask-1);backdrop-filter:blur(2px);flex-direction:column;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}.Lw7UvW_mermaidModalToolbar{z-index:10;gap:8px;display:flex;position:absolute;top:16px;right:16px}.Lw7UvW_mermaidModalButton{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);width:36px;height:36px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-strong-13);cursor:pointer;border-radius:8px;justify-content:center;align-items:center;display:inline-flex}.Lw7UvW_mermaidModalButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_mermaidModalStage{justify-content:center;align-items:center;width:90vw;height:80vh;display:flex;position:relative;overflow:hidden}.Lw7UvW_mermaidModalStage svg{cursor:grab;transform-origin:50%;user-select:none;-webkit-user-drag:none;background:var(--dsw-alias-bg-layer-1);border-radius:12px;max-width:none;max-height:none;padding:16px}.Lw7UvW_mermaidModalStage svg:active{cursor:grabbing}.Lw7UvW_mermaidModalHint{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xxxs-11);pointer-events:none;position:absolute;bottom:16px;left:50%;transform:translate(-50%)}.Lw7UvW_selectionPopup{z-index:60;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);height:28px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxxs-strong-11);white-space:nowrap;cursor:pointer;border-radius:6px;align-items:center;padding:0 10px;display:inline-flex;position:fixed;transform:translate(-50%,calc(-100% - 8px))}.Lw7UvW_selectionPopup:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_editorPdf{background:var(--dsw-alias-bg-base);flex-direction:column;flex:1;min-height:0;display:flex}.Lw7UvW_editorPdfToolbar{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;justify-content:flex-end;padding:6px 8px;display:flex}.Lw7UvW_editorPdfStage{flex:1;min-height:0;display:flex;position:relative}.Lw7UvW_editorPdfFrame{background:var(--dsw-alias-bg-base);border:none;flex:1;width:100%;min-height:0}.Lw7UvW_editorPdfFrameBlocked{pointer-events:none}.Lw7UvW_editorPdfDragShield{z-index:4;pointer-events:none;background:0 0;position:absolute;inset:0}.Lw7UvW_editorPdfDragShieldActive{pointer-events:auto}body[data-dsh-tab-dragging] .Lw7UvW_editorPdfFrame{pointer-events:none!important}body[data-dsh-tab-dragging] .Lw7UvW_editorPdfDragShield{pointer-events:auto!important}.Lw7UvW_terminalWrap{background:var(--dsw-alias-bg-base);flex-direction:column;flex:1;min-height:0;display:flex;position:relative}.Lw7UvW_terminal{flex:1;min-height:0;padding:6px 4px 6px 8px}.Lw7UvW_terminal .xterm{height:100%}.Lw7UvW_terminalBanner{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary);flex-wrap:wrap;flex:none;align-items:center;gap:8px;padding:3px 10px;display:flex}.Lw7UvW_terminalBannerUrl{word-break:break-all;opacity:.85;flex-basis:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.Lw7UvW_boundaryError{z-index:50;background:var(--dsw-alias-bg-layer-1);border-left:1px solid var(--dsw-alias-border-l2);font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);flex-direction:column;align-items:flex-start;gap:8px;padding:16px;display:flex;position:fixed;top:0;bottom:0;right:0;overflow:auto}.Lw7UvW_terminalRetry{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxxs-strong-11);cursor:pointer;border-radius:999px;flex:none;padding:1px 8px}.Lw7UvW_terminalRetry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_terminalDepsBanner{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary);flex-direction:column;flex:none;gap:6px;padding:10px;display:flex}.Lw7UvW_terminalDepsTitle{font:var(--dsw-font-xxs-strong-12);color:var(--dsw-alias-state-warn-primary)}.Lw7UvW_terminalDepsHint{opacity:.9}.Lw7UvW_terminalDepsCommandRow{align-items:flex-start;gap:8px;display:flex}.Lw7UvW_terminalRepairCommand{white-space:pre-wrap;word-break:break-all;user-select:text;min-width:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:4px;flex:1;max-height:160px;margin:0;padding:6px 8px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.5;overflow:auto}.Lw7UvW_terminalDepsNote{opacity:.85}.Lw7UvW_terminalDepsActions{align-items:center;gap:8px;display:flex}.Lw7UvW_tabBoundaryError{min-height:0;font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);flex-direction:column;flex:1;align-items:flex-start;gap:8px;padding:12px 16px;display:flex;overflow:auto}.Lw7UvW_git{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex;overflow:hidden auto}.Lw7UvW_gitHeader{flex:none;align-items:center;gap:8px;height:36px;padding:0 8px 0 12px;display:flex}.Lw7UvW_gitBranchSelect{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);min-width:0;height:26px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12);border-radius:6px;flex:1;padding:0 6px}.Lw7UvW_gitSection{border-top:1px solid var(--dsw-alias-border-l1)}.Lw7UvW_gitSectionHeader{font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-tertiary);text-transform:uppercase;justify-content:space-between;align-items:center;padding:6px 12px 4px;display:flex}.Lw7UvW_gitLink{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-brand-primary);cursor:pointer;background:0 0;border:none;padding:0}.Lw7UvW_gitLink:hover:not(:disabled){text-decoration:underline}.Lw7UvW_gitLink:disabled{opacity:.4;cursor:default}.Lw7UvW_gitRow{min-height:34px;animation:Lw7UvW_dsh-row-in .15s var(--ds-ease-in-out);border-radius:8px;align-items:center;gap:6px;margin:0 6px;padding:0 8px;display:flex}.Lw7UvW_gitRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_gitRowSelected{background:var(--dsw-alias-interactive-bg-active)}.Lw7UvW_gitRowMain{cursor:pointer;text-align:left;background:0 0;border:none;flex:1;align-items:center;gap:8px;min-width:0;padding:3px 0;display:flex}.Lw7UvW_gitBadge{width:20px;height:16px;font:var(--dsw-font-xxxs-strong-11);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;justify-content:center;align-items:center;display:inline-flex}.Lw7UvW_gitName{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);flex:1;overflow:hidden}.Lw7UvW_gitEmpty{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);padding:4px 12px 8px}.Lw7UvW_gitPlaceholder{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);text-align:center;padding:16px}.Lw7UvW_gitError{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);white-space:pre-wrap;padding:8px 12px}.Lw7UvW_gitDiff{border-top:1px solid var(--dsw-alias-border-l1);padding:8px}.Lw7UvW_gitDiffTab{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex;overflow:hidden auto}.Lw7UvW_gitDiffTabHeader{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:center;gap:8px;height:36px;padding:0 8px 0 12px;display:flex}.Lw7UvW_gitDiffTabTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:var(--dsw-font-xxs-strong-12);color:var(--dsw-alias-label-primary);flex:1;overflow:hidden}.Lw7UvW_gitDiffFile{align-items:baseline;gap:6px;padding:8px 2px 2px;display:flex}.Lw7UvW_gitDiffFilePath{font:var(--dsw-font-xxs-strong-12);color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.Lw7UvW_gitDiffFileOld{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:40%;overflow:hidden}.Lw7UvW_gitDiffFileTag{border:1px solid var(--dsw-alias-border-l2);font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:0 6px}.Lw7UvW_gitDiffHunk{font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-tertiary);gap:8px;padding:3px 2px;display:flex}.Lw7UvW_gitDiffHunkHeader{color:var(--dsw-alias-label-secondary);flex:none}.Lw7UvW_gitDiffHunkSection{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.Lw7UvW_gitDiffLine{font:var(--dsw-font-markdown-code-block-small);white-space:pre-wrap;overflow-wrap:anywhere;align-items:stretch;min-width:0;line-height:20px;display:flex}.Lw7UvW_gitDiffNum{text-align:right;width:36px;color:var(--dsw-alias-label-tertiary);user-select:none;flex:none;padding-right:8px}.Lw7UvW_gitDiffCode{flex:1;min-width:0;overflow:visible}.Lw7UvW_gitDiffCtx{color:var(--dsw-alias-label-primary)}.Lw7UvW_gitDiffDel{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)}.Lw7UvW_gitDiffAdd{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)}.Lw7UvW_gitDiffMeta{padding-left:2px}.Lw7UvW_gitDiffMetaText{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);font-style:italic}.Lw7UvW_gitDiffExpand{width:100%;font:var(--dsw-font-xxs-12);color:var(--dsw-alias-brand-primary);cursor:pointer;text-align:center;background:0 0;border:none;margin:4px 0;display:block}.Lw7UvW_gitDiffExpand:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_gitConfirmDesc{font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);white-space:pre-wrap;margin:0}.Lw7UvW_gitCommit{border-top:1px solid var(--dsw-alias-border-l1);align-items:center;gap:6px;padding:8px 12px;display:flex}.Lw7UvW_gitCommitInput{flex:1;min-width:0}.Lw7UvW_gitCommitButton{background:var(--dsw-alias-button-primary-fill);height:26px;color:var(--dsw-alias-label-primary-inverted);font:var(--dsw-font-xxs-strong-12);cursor:pointer;border:none;border-radius:6px;flex:none;padding:0 12px}.Lw7UvW_gitCommitButton:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}.Lw7UvW_gitCommitButton:disabled{opacity:.45;cursor:default}.Lw7UvW_gitLogRow{cursor:pointer;border-radius:8px;flex-direction:column;gap:2px;padding:5px 12px;display:flex}.Lw7UvW_gitLogRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.Lw7UvW_gitLogLine1{align-items:baseline;gap:8px;min-width:0;display:flex}.Lw7UvW_gitLogHash{font:var(--dsw-font-markdown-code-block-small);color:var(--dsw-alias-label-tertiary);flex:none}.Lw7UvW_gitLogLine2{flex-wrap:wrap;align-items:center;gap:6px;min-width:0;display:flex}.Lw7UvW_gitLogRef{border:1px solid var(--dsw-alias-border-l2);font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-brand-primary);white-space:nowrap;border-radius:999px;flex:none;padding:0 5px}.Lw7UvW_gitLogSubject{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);flex:1;overflow:hidden}.Lw7UvW_gitLogMeta{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_gitLogMore{border:1px solid var(--dsw-alias-border-l2);width:calc(100% - 24px);font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;margin:4px 12px 8px;padding:6px 0;display:block}.Lw7UvW_gitLogMore:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_gitLogMore:disabled{opacity:.5;cursor:default}.Lw7UvW_producedRow{flex-wrap:wrap;align-items:center;gap:8px;padding:4px 0;display:flex}.Lw7UvW_producedLabel{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_producedChip{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);max-width:200px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12);cursor:pointer;border-radius:999px;align-items:center;gap:4px;padding:2px 8px;display:inline-flex;overflow:hidden}.Lw7UvW_producedChip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.Lw7UvW_producedChip span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.Lw7UvW_producedMore{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary)}.Lw7UvW_toggleButton:focus-visible,.Lw7UvW_bottomClose:focus-visible,.Lw7UvW_iconButton:focus-visible,.Lw7UvW_tab:focus-visible,.Lw7UvW_tabClose:focus-visible,.Lw7UvW_tabBarPlus:focus-visible,.Lw7UvW_paneCard:focus-visible,.Lw7UvW_explorerRow:focus-visible,.Lw7UvW_explorerRef:focus-visible,.Lw7UvW_gitRowMain:focus-visible,.Lw7UvW_gitLink:focus-visible,.Lw7UvW_gitCommitButton:focus-visible,.Lw7UvW_gitLogRow:focus-visible,.Lw7UvW_gitLogMore:focus-visible,.Lw7UvW_gitDiffExpand:focus-visible,.Lw7UvW_terminalRetry:focus-visible,.Lw7UvW_editorModeButton:focus-visible,.Lw7UvW_editorDownloadLink:focus-visible,.Lw7UvW_editorPptxButton:focus-visible,.Lw7UvW_editorDocxZoomRange:focus-visible{outline:2px solid var(--dsw-alias-interactive-bg-hover-accent);outline-offset:-1px}@media (prefers-reduced-motion:reduce){.Lw7UvW_panel,.Lw7UvW_panelHidden,.Lw7UvW_bottomPanel,.Lw7UvW_bottomPanelHidden,.Lw7UvW_toggleCluster,.Lw7UvW_toggleButton,.Lw7UvW_tab,.Lw7UvW_tabBarPlus,.Lw7UvW_paneCard,.Lw7UvW_explorerRow,.Lw7UvW_gitRow,.Lw7UvW_divider,.Lw7UvW_dividerRow:after,.Lw7UvW_dividerCol:after{transition:none;animation:none}}@media (width<=767px){.Lw7UvW_panel:not(.Lw7UvW_panelHidden) .Lw7UvW_tabBar{padding-right:40px}.Lw7UvW_toggleCluster[data-side=left]{left:auto;right:10px}.Lw7UvW_tab{min-width:48px;max-width:128px}}.Lw7UvW_bookmarksOverlay{z-index:100;background:var(--dsw-alias-bg-layer-2,#fff);border:1px solid var(--dsw-alias-border-l1,#dcdcdc);flex-direction:column;display:flex;position:absolute;inset:0}.Lw7UvW_bookmarksHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#dcdcdc);font:var(--dsw-font-sm-s-13);justify-content:space-between;align-items:center;padding:8px 12px;font-weight:600;display:flex}.Lw7UvW_bookmarksList{flex:1;margin:0;padding:4px 0;list-style:none;overflow-y:auto}.Lw7UvW_bookmarksEmpty{color:var(--dsw-alias-label-tertiary,#888);font:var(--dsw-font-xxs-12);text-align:center;padding:16px 12px}.Lw7UvW_bookmarksItem{align-items:center;gap:4px;padding:2px 8px;display:flex}.Lw7UvW_bookmarksItem:hover{background:var(--dsw-alias-bg-layer-1,#f5f5f5)}.Lw7UvW_bookmarksOpenBtn{text-align:left;cursor:pointer;background:0 0;border:0;border-radius:4px;flex-direction:column;flex:1;align-items:flex-start;min-width:0;padding:6px 8px;display:flex}.Lw7UvW_bookmarksTitle{font:var(--dsw-font-sm-s-13);color:var(--dsw-alias-label-primary,#111);text-overflow:ellipsis;white-space:nowrap;max-width:100%;overflow:hidden}.Lw7UvW_bookmarksUrl{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary,#888);text-overflow:ellipsis;white-space:nowrap;max-width:100%;overflow:hidden}';
var tagId = "dsh-external/dsh-better-sidebar/sidebar.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-external/dsh-better-sidebar";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default = { "explorerCopied": "Lw7UvW_explorerCopied", "editor": "Lw7UvW_editor", "editorTreeResize": "Lw7UvW_editorTreeResize", "editorTreeSearch": "Lw7UvW_editorTreeSearch", "browserBlockedButton": "Lw7UvW_browserBlockedButton", "gitHeader": "Lw7UvW_gitHeader", "gitDiffHunk": "Lw7UvW_gitDiffHunk", "orphanedType": "Lw7UvW_orphanedType", "terminalDepsBanner": "Lw7UvW_terminalDepsBanner", "editorPptxButton": "Lw7UvW_editorPptxButton", "editorSearchResult": "Lw7UvW_editorSearchResult", "paneDrop": "Lw7UvW_paneDrop", "browserWebview": "Lw7UvW_browserWebview", "mermaidWrap": "Lw7UvW_mermaidWrap", "mermaidBody": "Lw7UvW_mermaidBody", "explorerDir": "Lw7UvW_explorerDir", "splitCol": "Lw7UvW_splitCol", "tabTitle": "Lw7UvW_tabTitle", "gitSectionHeader": "Lw7UvW_gitSectionHeader", "panelResize": "Lw7UvW_panelResize", "producedLabel": "Lw7UvW_producedLabel", "sandboxStatusOff": "Lw7UvW_sandboxStatusOff", "editorHtml": "Lw7UvW_editorHtml", "terminalDepsCommandRow": "Lw7UvW_terminalDepsCommandRow", "tabBarDrop": "Lw7UvW_tabBarDrop", "panelHidden": "Lw7UvW_panelHidden", "toggleButton": "Lw7UvW_toggleButton", "editorModeButton": "Lw7UvW_editorModeButton", "terminalBannerUrl": "Lw7UvW_terminalBannerUrl", "browserZoomValue": "Lw7UvW_browserZoomValue", "pane": "Lw7UvW_pane", "editorTreePanelFull": "Lw7UvW_editorTreePanelFull", "terminalDepsTitle": "Lw7UvW_terminalDepsTitle", "terminalDepsActions": "Lw7UvW_terminalDepsActions", "gitDiffTab": "Lw7UvW_gitDiffTab", "terminalRepairCommand": "Lw7UvW_terminalRepairCommand", "splitChild": "Lw7UvW_splitChild", "editorBinaryNotice": "Lw7UvW_editorBinaryNotice", "browserBar": "Lw7UvW_browserBar", "dropCenter": "Lw7UvW_dropCenter", "editorBody": "Lw7UvW_editorBody", "tabClose": "Lw7UvW_tabClose", "editorPdf": "Lw7UvW_editorPdf", "gitLogHash": "Lw7UvW_gitLogHash", "gitDiffMeta": "Lw7UvW_gitDiffMeta", "editorPdfToolbar": "Lw7UvW_editorPdfToolbar", "bookmarksList": "Lw7UvW_bookmarksList", "paneEmptyCards": "Lw7UvW_paneEmptyCards", "mermaidCode": "Lw7UvW_mermaidCode", "gitDiff": "Lw7UvW_gitDiff", "editorMain": "Lw7UvW_editorMain", "gitSection": "Lw7UvW_gitSection", "gitDiffFileOld": "Lw7UvW_gitDiffFileOld", "browserStart": "Lw7UvW_browserStart", "bookmarksEmpty": "Lw7UvW_bookmarksEmpty", "gitDiffCtx": "Lw7UvW_gitDiffCtx", "editorCmHidden": "Lw7UvW_editorCmHidden", "editorPlaceholder": "Lw7UvW_editorPlaceholder", "paneContent": "Lw7UvW_paneContent", "editorModeActive": "Lw7UvW_editorModeActive", "editorImage": "Lw7UvW_editorImage", "panelBody": "Lw7UvW_panelBody", "dividerCol": "Lw7UvW_dividerCol", "mermaidModalButton": "Lw7UvW_mermaidModalButton", "explorer": "Lw7UvW_explorer", "mermaidCopy": "Lw7UvW_mermaidCopy", "mermaidModalToolbar": "Lw7UvW_mermaidModalToolbar", "gitLogMore": "Lw7UvW_gitLogMore", "gitLogLine2": "Lw7UvW_gitLogLine2", "bookmarksOverlay": "Lw7UvW_bookmarksOverlay", "gitDiffMetaText": "Lw7UvW_gitDiffMetaText", "bookmarksOpenBtn": "Lw7UvW_bookmarksOpenBtn", "gitBadge": "Lw7UvW_gitBadge", "toggleCluster": "Lw7UvW_toggleCluster", "gitDiffFilePath": "Lw7UvW_gitDiffFilePath", "gitRowSelected": "Lw7UvW_gitRowSelected", "mermaidInfo": "Lw7UvW_mermaidInfo", "gitPlaceholder": "Lw7UvW_gitPlaceholder", "sandboxDot": "Lw7UvW_sandboxDot", "editorTreeToggleActive": "Lw7UvW_editorTreeToggleActive", "editorTreePanel": "Lw7UvW_editorTreePanel", "browser": "Lw7UvW_browser", "editorImageWrap": "Lw7UvW_editorImageWrap", "gitEmpty": "Lw7UvW_gitEmpty", "tabBar": "Lw7UvW_tabBar", "dropOverlay": "Lw7UvW_dropOverlay", "editorModeToggle": "Lw7UvW_editorModeToggle", "mermaidError": "Lw7UvW_mermaidError", "gitConfirmDesc": "Lw7UvW_gitConfirmDesc", "dividerRow": "Lw7UvW_dividerRow", "panelResizeActive": "Lw7UvW_panelResizeActive", "split": "Lw7UvW_split", "editorBanner": "Lw7UvW_editorBanner", "browserFrame": "Lw7UvW_browserFrame", "dirtyDot": "Lw7UvW_dirtyDot", "browserBlockedDesc": "Lw7UvW_browserBlockedDesc", "editorMd": "Lw7UvW_editorMd", "mermaidMarkdown": "Lw7UvW_mermaidMarkdown", "gitDiffNum": "Lw7UvW_gitDiffNum", "explorerSymlink": "Lw7UvW_explorerSymlink", "explorerBroken": "Lw7UvW_explorerBroken", "dropLeft": "Lw7UvW_dropLeft", "gitDiffTabHeader": "Lw7UvW_gitDiffTabHeader", "bottomPanel": "Lw7UvW_bottomPanel", "dsh-row-in": "Lw7UvW_dsh-row-in", "dividerActive": "Lw7UvW_dividerActive", "editorError": "Lw7UvW_editorError", "gitBranchSelect": "Lw7UvW_gitBranchSelect", "gitDiffTabTitle": "Lw7UvW_gitDiffTabTitle", "browserZoom": "Lw7UvW_browserZoom", "terminalBanner": "Lw7UvW_terminalBanner", "editorPdfStage": "Lw7UvW_editorPdfStage", "paneTabHidden": "Lw7UvW_paneTabHidden", "git": "Lw7UvW_git", "cornerHandle": "Lw7UvW_cornerHandle", "editorDownloadLink": "Lw7UvW_editorDownloadLink", "gitDiffLine": "Lw7UvW_gitDiffLine", "gitLogRow": "Lw7UvW_gitLogRow", "editorTreeDock": "Lw7UvW_editorTreeDock", "tabBadge": "Lw7UvW_tabBadge", "gitLogLine1": "Lw7UvW_gitLogLine1", "producedRow": "Lw7UvW_producedRow", "editorPdfFrameBlocked": "Lw7UvW_editorPdfFrameBlocked", "explorerBody": "Lw7UvW_explorerBody", "mermaidHeader": "Lw7UvW_mermaidHeader", "terminalWrap": "Lw7UvW_terminalWrap", "gitCommitButton": "Lw7UvW_gitCommitButton", "gitLogSubject": "Lw7UvW_gitLogSubject", "dropDown": "Lw7UvW_dropDown", "editorHeader": "Lw7UvW_editorHeader", "explorerEmpty": "Lw7UvW_explorerEmpty", "gitName": "Lw7UvW_gitName", "gitDiffHunkHeader": "Lw7UvW_gitDiffHunkHeader", "panel": "Lw7UvW_panel", "bottomClose": "Lw7UvW_bottomClose", "divider": "Lw7UvW_divider", "explorerHidden": "Lw7UvW_explorerHidden", "explorerRef": "Lw7UvW_explorerRef", "sandboxAction": "Lw7UvW_sandboxAction", "browserBlockedActions": "Lw7UvW_browserBlockedActions", "editorPdfDragShield": "Lw7UvW_editorPdfDragShield", "gitRow": "Lw7UvW_gitRow", "gitError": "Lw7UvW_gitError", "splitRow": "Lw7UvW_splitRow", "tabBarPlus": "Lw7UvW_tabBarPlus", "sandboxStatus": "Lw7UvW_sandboxStatus", "tabList": "Lw7UvW_tabList", "tab": "Lw7UvW_tab", "explorerRoot": "Lw7UvW_explorerRoot", "gitDiffFile": "Lw7UvW_gitDiffFile", "gitCommit": "Lw7UvW_gitCommit", "mermaidModalStage": "Lw7UvW_mermaidModalStage", "mermaidModal": "Lw7UvW_mermaidModal", "sandboxStatusOn": "Lw7UvW_sandboxStatusOn", "gitLink": "Lw7UvW_gitLink", "dropRight": "Lw7UvW_dropRight", "gitCommitInput": "Lw7UvW_gitCommitInput", "workbench": "Lw7UvW_workbench", "bottomResizeActive": "Lw7UvW_bottomResizeActive", "editorSearchInput": "Lw7UvW_editorSearchInput", "gitDiffExpand": "Lw7UvW_gitDiffExpand", "editorPathInput": "Lw7UvW_editorPathInput", "gitLogRef": "Lw7UvW_gitLogRef", "editorPdfDragShieldActive": "Lw7UvW_editorPdfDragShieldActive", "bookmarksHeader": "Lw7UvW_bookmarksHeader", "bookmarksTitle": "Lw7UvW_bookmarksTitle", "browserBlockedTitle": "Lw7UvW_browserBlockedTitle", "gitDiffAdd": "Lw7UvW_gitDiffAdd", "producedMore": "Lw7UvW_producedMore", "gitDiffHunkSection": "Lw7UvW_gitDiffHunkSection", "browserBlocked": "Lw7UvW_browserBlocked", "explorerHeader": "Lw7UvW_explorerHeader", "paneTab": "Lw7UvW_paneTab", "bottomResize": "Lw7UvW_bottomResize", "browserMessage": "Lw7UvW_browserMessage", "sandboxStatusText": "Lw7UvW_sandboxStatusText", "editorCm": "Lw7UvW_editorCm", "editorDocxZoomRange": "Lw7UvW_editorDocxZoomRange", "bookmarksUrl": "Lw7UvW_bookmarksUrl", "bookmarksItem": "Lw7UvW_bookmarksItem", "iconButton": "Lw7UvW_iconButton", "explorerRow": "Lw7UvW_explorerRow", "explorerName": "Lw7UvW_explorerName", "editorBinary": "Lw7UvW_editorBinary", "boundaryError": "Lw7UvW_boundaryError", "bottomPanelHidden": "Lw7UvW_bottomPanelHidden", "terminal": "Lw7UvW_terminal", "terminalDepsHint": "Lw7UvW_terminalDepsHint", "paneCard": "Lw7UvW_paneCard", "gitDiffDel": "Lw7UvW_gitDiffDel", "tabActive": "Lw7UvW_tabActive", "browserInput": "Lw7UvW_browserInput", "dropUp": "Lw7UvW_dropUp", "explorerError": "Lw7UvW_explorerError", "terminalDepsNote": "Lw7UvW_terminalDepsNote", "tabBoundaryError": "Lw7UvW_tabBoundaryError", "gitRowMain": "Lw7UvW_gitRowMain", "gitDiffCode": "Lw7UvW_gitDiffCode", "mermaidModalHint": "Lw7UvW_mermaidModalHint", "editorPdfFrame": "Lw7UvW_editorPdfFrame", "editorStatusError": "Lw7UvW_editorStatusError", "gitLogMeta": "Lw7UvW_gitLogMeta", "editorSearchHint": "Lw7UvW_editorSearchHint", "editorTitle": "Lw7UvW_editorTitle", "selectionPopup": "Lw7UvW_selectionPopup", "gitDiffFileTag": "Lw7UvW_gitDiffFileTag", "terminalRetry": "Lw7UvW_terminalRetry", "producedChip": "Lw7UvW_producedChip", "editorStatus": "Lw7UvW_editorStatus" };

// src/client/intercept.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function openSidebarFile(ctx, store, sessionId, path) {
  const summary = ctx.sessions.list.getSnapshot().byId[sessionId];
  const absolute = resolveSidebarPath(summary?.cwd, path);
  const at = Math.max(absolute.lastIndexOf("/"), absolute.lastIndexOf("\\"));
  const title = at === -1 ? absolute : absolute.slice(at + 1);
  ctx.betterSidebar?.openTab({ type: "editor", title, path: absolute, id: `editor:${absolute}` });
}
function SidebarProducedFiles(props) {
  const { matched, openInSidebar } = props;
  const shown = matched.slice(0, 6);
  const hidden = matched.length - shown.length;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.producedRow, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.producedLabel, children: t("produced") }),
    shown.map((path) => {
      const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
      const name = at === -1 ? path : path.slice(at + 1);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.producedChip,
          title: path,
          onClick: () => {
            openInSidebar(path);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCodeOutline16, { size: 12 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: name })
          ]
        },
        path
      );
    }),
    hidden > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.producedMore, children: [
      "+",
      hidden
    ] })
  ] });
}
function registerTurnTailInterception(ctx, store) {
  return ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
    name: "conversation.chat.turnTail",
    // Decline the takeover while the editor tab type is disabled in the side
    // card settings: the produced-files row falls back to the default
    // deliverables behavior instead of offering chips that cannot open. Also
    // while the sidebar is externally disabled (aionui-panel chosen).
    select: (owner) => {
      if (store.getSuspended()) return null;
      if (store.getPrefs().tabsEnabled["editor"] === false) return null;
      return selectProducedFiles(owner);
    },
    priority: -1,
    registrant: "dsh-better-sidebar",
    inject: (sessionId) => ({
      openInSidebar: (path) => {
        openSidebarFile(ctx, store, sessionId, path);
      }
    })
  }, SidebarProducedFiles));
}
function registerOpenPathInterception(ctx, store) {
  return wrapOpenPath(ctx.workspaces, {
    takeoverEnabled: () => !store.getSuspended() && store.getPrefs().interceptOpenPath !== false && store.getPrefs().tabsEnabled["editor"] !== false,
    currentSessionId: () => ctx.sessions.list.getSnapshot().current,
    openInSidebar: (path, sessionId) => {
      openSidebarFile(ctx, store, sessionId, path);
    }
  });
}

// src/client/EditorHost.tsx
var import_react4 = require("react");
var import_react5 = require("react");

// node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t2, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t2 = 0; t2 < o; t2++) e[t2] && (f = r(e[t2])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t2, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t2 = r(e)) && (n && (n += " "), n += t2);
  return n;
}
var clsx_default = clsx;

// src/client/EditorHost.tsx
var import_dsh_client_ui_primitives4 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/api.ts
var SidebarApiError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
};
async function call(method, payload, signal) {
  let response;
  try {
    response = await fetch(`/sidebar/api/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal
    });
  } catch (error) {
    throw new SidebarApiError("network", error instanceof Error ? error.message : String(error));
  }
  const parsed = await response.json().catch(() => null);
  if (!response.ok || parsed === null || parsed.ok !== true || parsed.value === void 0) {
    throw new SidebarApiError(
      parsed?.error?.code ?? "http",
      parsed?.error?.message ?? `HTTP ${response.status}`
    );
  }
  return parsed.value;
}
function scopePayload(scope, extra) {
  return { sessionId: scope.sessionId, ...scope.cwd !== void 0 && scope.cwd !== "" ? { cwd: scope.cwd } : {}, ...extra };
}
var api = {
  sessionCwd: (scope, signal) => call("session.cwd", scopePayload(scope, {}), signal),
  fsTree: (scope, path, signal) => call("fs.tree", scopePayload(scope, { path }), signal),
  /** Global recursive file-name search rooted at the session cwd (the editor
   *  side panel's search box); matches are cwd-relative '/'-separated paths. */
  fsSearch: (scope, query, signal) => call("fs.search", scopePayload(scope, { query }), signal),
  fsRead: (scope, path, signal) => call("fs.read", scopePayload(scope, { path }), signal),
  fsWrite: (scope, path, content) => call("fs.write", scopePayload(scope, { path, content })),
  gitStatus: (scope, signal) => call("git.status", scopePayload(scope, {}), signal),
  gitDiff: (scope, path, staged, signal) => call("git.diff", scopePayload(scope, { ...path !== void 0 ? { path } : {}, staged }), signal),
  gitStage: (scope, path) => call("git.stage", scopePayload(scope, { ...path !== void 0 ? { path } : {} })),
  gitUnstage: (scope, path) => call("git.unstage", scopePayload(scope, { ...path !== void 0 ? { path } : {} })),
  gitCommit: (scope, message) => call("git.commit", scopePayload(scope, { message })),
  gitBranch: (scope, signal) => call("git.branch", scopePayload(scope, {}), signal),
  gitCheckout: (scope, branch) => call("git.checkout", scopePayload(scope, { branch })),
  /** Recent commit history, lazily pageable (skip/count; defaults 0/30). */
  gitLog: (scope, count, skip, signal) => call("git.log", scopePayload(scope, {
    ...count !== void 0 ? { count } : {},
    ...skip !== void 0 ? { skip } : {}
  }), signal),
  /** Full patch text of one commit (diff display for the history rows). */
  gitCommitDiff: (scope, hash, signal) => call("git.commit-diff", scopePayload(scope, { hash }), signal),
  /** Discard the worktree changes of one file (the index is untouched). */
  gitDiscard: (scope, path) => call("git.discard", scopePayload(scope, { path })),
  /** Revert one commit onto the current branch. */
  gitRevert: (scope, hash) => call("git.revert", scopePayload(scope, { hash })),
  /** Cherry-pick one commit onto the current branch. */
  gitCherryPick: (scope, hash) => call("git.cherry-pick", scopePayload(scope, { hash })),
  /** Release a terminal's process immediately (tab closed; the WS close frame
   *  may be unreachable while the socket is down, so the host also accepts
   *  this explicit route). */
  ptyClose: (scope, tab) => call("pty.close", scopePayload(scope, { tab })),
  /** Release an agent terminal by uuid (tab closed while WS was down). */
  agentPtyClose: (uuid) => call("agent-pty.close", { uuid }),
  /** Terminal dependency status (issue #140): after a WS close 1011 with
   *  reason `pty-deps-missing` the view fetches the full repair details here
   *  (the close reason itself is capped at 123 bytes). */
  terminalDeps: () => call("terminal.deps", {}),
  /**
   * The output the model has read so far for one background job (replayed
   * from the owner session's event log — never the model's job_output
   * cursor). The scope MUST be the job's OWNER session.
   */
  jobOutput: (scope, id, signal) => call("jobs.output", scopePayload(scope, { id }), signal),
  /** Request cancellation of one background job (live jobs flip to stopping). */
  jobKill: (scope, id, reason) => call("jobs.kill", scopePayload(scope, {
    id,
    ...reason !== void 0 ? { reason } : {}
  })),
  /** The effective terminal shell and its display name (plugin-global). */
  shellGet: () => call("shell.get", {}),
  /** Read the side card preferences (plugin-global, no session scope). */
  settingsGet: () => call("settings.get", {}),
  /** Merge a patch into the side card preferences (revision-guarded). */
  settingsUpdate: (patch, expectedRevision) => call("settings.update", {
    patch,
    ...expectedRevision !== void 0 ? { expectedRevision } : {}
  }),
  /** Probe a URL's response headers (the sidebar browser's embeddability
   *  check; see the host's browser.probe route). */
  browserProbe: (url, signal) => call("browser.probe", { url }, signal),
  /** Whether the Lum1104 Chrome extension currently owns the bridge. */
  browserBridgeStatus: (signal) => call("browser.bridge.status", {}, signal),
  /** Navigate the extension-controlled real Chrome tab. */
  browserBridgeNavigate: (url, signal) => call("browser.bridge.navigate", { url }, signal),
  /** Report the ACTIVE embedded <webview> tab's guest webContentsId to the
   *  host, so the webview_* agent tools operate on exactly this page. The
   *  sessionId MUST match the agent session the tools run under. */
  browserRegisterWebContents: (sessionId, webContentsId, signal) => call("browser.registerWebContents", { sessionId, webContentsId }, signal)
};
function mediaUrl(scope, path) {
  return fileUrl(scope, path, false);
}
function downloadUrl(scope, path) {
  return fileUrl(scope, path, true);
}
function fileUrl(scope, path, download) {
  const params = new URLSearchParams({ sessionId: scope.sessionId, path });
  if (scope.cwd !== void 0 && scope.cwd !== "") params.set("cwd", scope.cwd);
  if (download) params.set("download", "1");
  return `/sidebar/file?${params.toString()}`;
}

// src/client/binary-download.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function BinaryDownload(props) {
  const { scope, path } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorBinary, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorBinaryNotice, children: t("binaryNoPreview") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("a", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorDownloadLink, href: downloadUrl(scope, path), download: true, children: t("downloadToView") })
  ] });
}

// src/client/editor-load.ts
function decodeHead(headBase64) {
  const binary = atob(headBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function planFirstMatch(viewer, mediaUrlOf) {
  if (viewer === void 0 || viewer.fetchStrategy === "binary-download") return { kind: "binary" };
  switch (viewer.fetchStrategy) {
    case "mediaUrl":
    case "none":
      return { kind: "render", viewer, mediaUrl: mediaUrlOf() };
    case "custom":
      return { kind: "customLoad", viewer };
    case "fsRead":
      return { kind: "fetchFsRead", viewer };
  }
}
function planFsReadOutcome(viewer, result, rematch, mediaUrlOf) {
  if (!result.binary) {
    return { kind: "render", viewer, content: result.content, truncated: result.truncated };
  }
  const claimed = result.head === void 0 ? void 0 : rematch(decodeHead(result.head));
  if (claimed !== void 0 && claimed.fetchStrategy === "custom") {
    return { kind: "customLoad", viewer: claimed };
  }
  if (claimed !== void 0 && (claimed.fetchStrategy === "mediaUrl" || claimed.fetchStrategy === "none")) {
    return { kind: "render", viewer: claimed, mediaUrl: mediaUrlOf() };
  }
  return { kind: "binary" };
}

// src/client/FileTree.tsx
var import_react2 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime3 = require("react/jsx-runtime");
function baseName(path) {
  const trimmed = path.replace(/[\\/]+$/, "");
  const at = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  return at === -1 ? trimmed : trimmed.slice(at + 1);
}
var COPIED_MS = 1200;
function FileTree(props) {
  const { sessionId, cwd, expanded, onToggle, onOpenFile, onOpenFileNewTab, onOpenFileSide, onReferenceFile, refreshTick } = props;
  const [data, setData] = (0, import_react2.useState)({});
  const dataRef = (0, import_react2.useRef)(data);
  const [copiedPath, setCopiedPath] = (0, import_react2.useState)(null);
  const [rowMenu, setRowMenu] = (0, import_react2.useState)(null);
  const storeLevel = (0, import_react2.useCallback)((path, level) => {
    dataRef.current = { ...dataRef.current, [path]: level };
    setData(dataRef.current);
  }, []);
  const loadDir = (0, import_react2.useCallback)((dir) => {
    if (dataRef.current[dir] !== void 0) return;
    storeLevel(dir, {});
    api.fsTree({ sessionId, cwd }, dir).then((listing) => {
      storeLevel(dir, { entries: listing.entries });
    }).catch((error) => {
      storeLevel(dir, { error: error instanceof Error ? error.message : String(error) });
    });
  }, [sessionId, cwd, storeLevel]);
  const lastTick = (0, import_react2.useRef)(refreshTick);
  (0, import_react2.useEffect)(() => {
    if (lastTick.current === refreshTick) return;
    lastTick.current = refreshTick;
    dataRef.current = {};
    setData({});
  }, [refreshTick]);
  (0, import_react2.useEffect)(() => {
    const root2 = cwd;
    if (root2 === void 0) return;
    loadDir(root2);
    for (const dir of expanded) loadDir(dir);
  }, [cwd, expanded, refreshTick, loadDir]);
  const copyPath = (0, import_react2.useCallback)((text, path) => {
    void (0, import_dsh_client_ui_primitives2.writeClipboard)(text).then((ok) => {
      if (!ok) return;
      setCopiedPath(path);
      window.setTimeout(() => {
        setCopiedPath((current) => current === path ? null : current);
      }, COPIED_MS);
    });
  }, []);
  const rowActions = (entry) => {
    if (copiedPath === entry.path) {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerCopied, children: t("copied") });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "button",
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRef,
        "aria-label": t("referenceFile"),
        title: t("referenceFile"),
        onClick: (event) => {
          event.stopPropagation();
          onReferenceFile(entry.path);
        },
        children: t("referenceFile")
      }
    );
  };
  const openRowMenu = (event, path, isDir) => {
    event.preventDefault();
    event.stopPropagation();
    setRowMenu({ path, isDir, x: event.clientX, y: event.clientY });
  };
  const downloadFile = (path) => {
    const url = downloadUrl({ sessionId, cwd }, path);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };
  const root = cwd;
  const renderLevel = (dir, depth) => {
    const level = data[dir];
    if (level === void 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRow, style: { paddingLeft: depth * 22 + 6 }, children: t("loading") });
    }
    if (level.error !== void 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRow, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerError), style: { paddingLeft: depth * 22 + 6 }, children: level.error });
    }
    const entries = level.entries ?? [];
    return entries.map((entry) => {
      if (entry.isDir) {
        const isOpen = expanded.includes(entry.path);
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "div",
            {
              role: "button",
              tabIndex: 0,
              className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRow, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerDir, entry.hidden && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerHidden),
              style: { paddingLeft: depth * 22 + 6 },
              onClick: () => {
                onToggle(entry.path);
              },
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggle(entry.path);
                }
              },
              onContextMenu: (event) => {
                openRowMenu(event, entry.path, true);
              },
              children: [
                isOpen ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconFolderOpen16, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconFolderClose16, { size: 14 }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerName, children: entry.name }),
                entry.isSymlink && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconLinkOutline16, { size: 12, className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerSymlink }),
                rowActions(entry)
              ]
            }
          ),
          isOpen && renderLevel(entry.path, depth + 1)
        ] }, entry.path);
      }
      return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "div",
        {
          role: "button",
          tabIndex: 0,
          className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRow, entry.hidden && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerHidden, entry.broken && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerBroken),
          style: { paddingLeft: depth * 22 + 6 },
          title: entry.broken ? `${entry.path} \u2014 ${t("brokenSymlink")}` : entry.path,
          onClick: () => {
            onOpenFile(entry.path);
          },
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenFile(entry.path);
            }
          },
          onContextMenu: (event) => {
            openRowMenu(event, entry.path, false);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCodeOutline16, { size: 14 }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerName, children: entry.name }),
            entry.isSymlink && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconLinkOutline16, { size: 12, className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerSymlink }),
            rowActions(entry)
          ]
        },
        entry.path
      );
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerBody, children: [
    root === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerEmpty, children: t("noSession") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "div",
        {
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRow,
          style: { paddingLeft: 6 },
          onContextMenu: (event) => {
            openRowMenu(event, root, true);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconFolderOpen16, { size: 14 }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerName, children: baseName(root) }),
            copiedPath === root ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerCopied, children: t("copied") }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerRef,
                "aria-label": t("referenceFile"),
                title: t("referenceFile"),
                onClick: (event) => {
                  event.stopPropagation();
                  onReferenceFile(root);
                },
                children: t("referenceFile")
              }
            )
          ]
        }
      ),
      data[root] !== void 0 && renderLevel(root, 1)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      import_dsh_client_ui_primitives2.Menu,
      {
        open: rowMenu !== null,
        onClose: () => {
          setRowMenu(null);
        },
        items: [
          // The open escapes head the FILE menu (dirs only get copy).
          ...rowMenu?.isDir === false && onOpenFileNewTab !== void 0 ? [{ id: "open-new-tab", label: t("openFileNewTab"), icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCodeOutline16, { size: 14 }) }] : [],
          ...rowMenu?.isDir === false && onOpenFileSide !== void 0 ? [{ id: "open-side", label: t("openFileSide"), icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconFolderOpen16, { size: 14 }) }] : [],
          // Download applies to files only (the host route refuses directories).
          ...rowMenu?.isDir === false ? [{ id: "download", label: t("download"), icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconDownloadOutline16, { size: 14 }) }] : [],
          { id: "relative", label: t("copyRelative"), icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCopyOutline16, { size: 14 }) },
          { id: "absolute", label: t("copyAbsolute"), icon: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_dsh_client_ui_primitives2.IconCopyOutline16, { size: 14 }) }
        ],
        onSelect: (id) => {
          const target = rowMenu;
          if (target === null) return;
          setRowMenu(null);
          if (id === "open-new-tab") {
            onOpenFileNewTab?.(target.path);
            return;
          }
          if (id === "open-side") {
            onOpenFileSide?.(target.path);
            return;
          }
          if (id === "download") {
            downloadFile(target.path);
            return;
          }
          copyPath(
            id === "relative" ? relativeTo(cwd ?? "", target.path) : target.path,
            target.path
          );
        },
        portal: true,
        align: "start",
        getAnchorRect: () => rowMenu === null ? null : new DOMRect(rowMenu.x, rowMenu.y, 0, 0),
        anchor: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", {})
      }
    )
  ] });
}

// src/client/TreePanel.tsx
var import_react3 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime4 = require("react/jsx-runtime");
function TreePanel(props) {
  const { sessionId, cwd, expanded, onToggle, onOpenFile, onOpenFileNewTab, onOpenFileSide, onReferenceFile, full } = props;
  const [query, setQuery] = (0, import_react3.useState)("");
  const [results, setResults] = (0, import_react3.useState)(null);
  const [error, setError] = (0, import_react3.useState)(null);
  const [refreshTick, setRefreshTick] = (0, import_react3.useState)(0);
  const needle = query.trim();
  (0, import_react3.useEffect)(() => {
    if (needle === "") {
      setResults(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      api.fsSearch({ sessionId, cwd }, needle, controller.signal).then((found) => {
        setResults(found);
        setError(null);
      }).catch((failure) => {
        if (controller.signal.aborted) return;
        setResults(null);
        setError(failure instanceof Error ? failure.message : String(failure));
      });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [sessionId, cwd, needle]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreePanel, full === true && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreePanelFull), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreeSearch, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchInput,
          value: query,
          placeholder: t("editorSearchPlaceholder"),
          spellCheck: false,
          onChange: (event) => {
            setQuery(event.target.value);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          onClick: () => {
            setRefreshTick((tick) => tick + 1);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_dsh_client_ui_primitives3.IconRefreshOutline16, { size: 14 })
        }
      )
    ] }),
    needle === "" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      FileTree,
      {
        sessionId,
        cwd,
        expanded,
        onToggle,
        onOpenFile,
        onOpenFileNewTab,
        onOpenFileSide,
        onReferenceFile,
        refreshTick
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.explorerBody, children: [
      error !== null && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchHint, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorError), children: error }),
      error === null && results === null && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchHint, children: t("loading") }),
      error === null && results !== null && results.matches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchHint, children: t("editorSearchNoResults") }),
      error === null && results !== null && results.matches.map((rel) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchResult,
          title: rel,
          onClick: () => {
            onOpenFile(resolveSidebarPath(cwd, rel));
          },
          children: rel
        },
        rel
      )),
      error === null && results?.truncated === true && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorSearchHint, children: t("editorSearchTruncated") })
    ] })
  ] });
}

// src/client/EditorHost.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var TREE_WIDTH_DEFAULT = 240;
var TREE_WIDTH_MIN = 160;
var TREE_WIDTH_MAX = 480;
function metaOf(tab) {
  return tab.meta !== null && typeof tab.meta === "object" && !Array.isArray(tab.meta) ? tab.meta : {};
}
function treeOpenOf(tab) {
  const treeOpen = metaOf(tab).treeOpen;
  return typeof treeOpen === "boolean" ? treeOpen : tab.path === void 0 || tab.path === "";
}
function treeWidthOf(tab) {
  const width = metaOf(tab).treeWidth;
  return typeof width === "number" && Number.isFinite(width) ? Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, Math.round(width))) : TREE_WIDTH_DEFAULT;
}
function patchMeta(ctx, tab, patch) {
  ctx.betterSidebar?.updateTab(tab.id, { meta: { ...metaOf(tab), ...patch } });
}
function clampTreeWidth(value) {
  return Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, Math.round(value)));
}
function EditorHost(props) {
  const { ctx, store, scope, tab, expanded, onToggleDir, onReferenceFile } = props;
  const path = tab.path ?? "";
  const title = tab.title;
  const [load, setLoad] = (0, import_react4.useState)({ status: "loading" });
  const inPlace = (0, import_react4.useSyncExternalStore)(
    (0, import_react4.useCallback)((callback) => store.subscribe(callback), [store]),
    (0, import_react4.useCallback)(() => store.getSnapshot().prefs.editorExplorer, [store])
  );
  const showEmpty = path === "";
  const treeOnly = showEmpty && !inPlace;
  const openFile = (absolute) => {
    if (inPlace) {
      ctx.betterSidebar?.updateTab(tab.id, { path: absolute, title: baseName(absolute) });
    } else {
      openSidebarFile(ctx, store, scope.sessionId, absolute);
    }
  };
  const openFileNewTab = (absolute) => {
    openSidebarFile(ctx, store, scope.sessionId, absolute);
  };
  const openFileSide = (absolute) => {
    store.reduce((state) => {
      const key = treeOf(state, tab.id);
      const pane = leafWithTab(state[key], tab.id) ?? firstLeaf(state[key]);
      const fresh = {
        id: mintTabId(),
        type: "editor",
        title: baseName(absolute),
        path: absolute,
        meta: { treeOpen: false }
      };
      const { node, leafId } = insertLeafAt(state[key], pane.id, "row", fresh, false);
      return { ...state, [key]: node, activePane: leafId };
    });
  };
  const [toolbar, setToolbar] = (0, import_react4.useState)(null);
  const controlsRef = (0, import_react4.useRef)(null);
  const onToolbarState = (0, import_react4.useCallback)((next) => {
    setToolbar((prev) => prev !== null && JSON.stringify(prev) === JSON.stringify(next) ? prev : next);
  }, []);
  const onToolbarControls = (0, import_react4.useCallback)((controls) => {
    controlsRef.current = controls;
  }, []);
  const [dragWidth, setDragWidth] = (0, import_react4.useState)(null);
  const dragRef = (0, import_react4.useRef)(null);
  const treeWidth = dragWidth ?? treeWidthOf(tab);
  const onResizeStart = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { startX: event.clientX, startWidth: treeWidth };
  };
  const onResizeMove = (event) => {
    const drag = dragRef.current;
    if (drag === null) return;
    setDragWidth(clampTreeWidth(drag.startWidth + (drag.startX - event.clientX)));
  };
  const onResizeEnd = (event) => {
    const drag = dragRef.current;
    if (drag === null) return;
    dragRef.current = null;
    setDragWidth(null);
    const finalWidth = clampTreeWidth(drag.startWidth + (drag.startX - event.clientX));
    if (finalWidth !== treeWidthOf(tab)) patchMeta(ctx, tab, { treeWidth: finalWidth });
  };
  (0, import_react4.useEffect)(() => {
    setToolbar(null);
    if (showEmpty) return;
    let cancelled = false;
    const controller = new AbortController();
    setLoad({ status: "loading" });
    const mediaUrlOf = () => mediaUrl(scope, path);
    const apply2 = (action) => {
      if (cancelled) return;
      switch (action.kind) {
        case "binary":
          setLoad({ status: "binary" });
          return;
        case "render":
          setLoad({
            status: "ready",
            viewer: action.viewer,
            content: action.content,
            truncated: action.truncated,
            mediaUrl: action.mediaUrl,
            customData: action.customData
          });
          return;
        case "customLoad":
          void action.viewer.load?.(path, scope, controller.signal).then((data) => {
            if (cancelled) return;
            setLoad({ status: "ready", viewer: action.viewer, customData: data });
          }).catch((error) => {
            if (cancelled) return;
            setLoad({ status: "error", message: error instanceof Error ? error.message : String(error) });
          });
          return;
        case "fetchFsRead":
          api.fsRead(scope, path).then((result) => {
            if (cancelled) return;
            const outcome = planFsReadOutcome(action.viewer, {
              binary: result.kind === "binary",
              content: result.kind === "text" ? result.content : "",
              truncated: result.truncated,
              head: result.kind === "binary" ? result.head : void 0
            }, (head) => ctx.betterSidebar?.matchFileViewer(path, head), mediaUrlOf);
            apply2(outcome);
          }).catch((error) => {
            if (cancelled) return;
            setLoad({ status: "error", message: error instanceof Error ? error.message : String(error) });
          });
          return;
      }
    };
    apply2(planFirstMatch(ctx.betterSidebar?.matchFileViewer(path), mediaUrlOf));
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [scope.sessionId, scope.cwd, path, ctx, showEmpty]);
  const treeOpen = treeOpenOf(tab);
  const toggleTree = () => {
    patchMeta(ctx, tab, { treeOpen: !treeOpen });
  };
  const saveLabel = toolbar === null ? "" : toolbar.saveState === "saving" ? t("loading") : toolbar.saveState === "saved" ? t("saved") : toolbar.saveState === "failed" ? t("saveFailed") : "";
  if (treeOnly) {
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editor, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      TreePanel,
      {
        full: true,
        sessionId: scope.sessionId,
        cwd: scope.cwd,
        expanded,
        onToggle: onToggleDir,
        onOpenFile: openFile,
        onOpenFileNewTab: openFileNewTab,
        onOpenFileSide: openFileSide,
        onReferenceFile
      }
    ) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editor, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(EditorPathInput, { path, cwd: scope.cwd, onOpen: openFile }, path),
      toolbar?.modes === true && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorModeToggle, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorModeButton, toolbar.mode === "preview" && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorModeActive),
            onClick: () => {
              controlsRef.current?.setMode("preview");
            },
            children: t("preview")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorModeButton, toolbar.mode === "edit" && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorModeActive),
            onClick: () => {
              controlsRef.current?.setMode("edit");
            },
            children: t("edit")
          }
        )
      ] }),
      toolbar?.dirty === true && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.dirtyDot, title: t("unsaved") }),
      toolbar?.editable === true && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("save"),
          title: `${t("save")} (Ctrl/Cmd+S)`,
          onClick: () => {
            controlsRef.current?.save();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives4.IconCheckOutline16, { size: 14 })
        }
      ),
      saveLabel !== "" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorStatus, toolbar?.saveState === "failed" && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorStatusError), children: saveLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "button",
        {
          type: "button",
          className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton, treeOpen && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreeToggleActive),
          "aria-label": t("editorTreeToggle"),
          title: t("editorTreeToggle"),
          "aria-pressed": treeOpen,
          onClick: toggleTree,
          children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives4.IconFolderOpen16, { size: 14 })
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorBody, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorMain, children: [
        showEmpty && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPlaceholder, children: t("editorEmptyHint") }),
        !showEmpty && load.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPlaceholder, children: t("loading") }),
        !showEmpty && load.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorError, children: load.message }),
        !showEmpty && load.status === "binary" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(BinaryDownload, { scope, path }),
        !showEmpty && load.status === "ready" && (0, import_react5.createElement)(load.viewer.component, {
          ctx,
          store,
          scope,
          path,
          title,
          viewerId: load.viewer.id,
          content: load.content,
          truncated: load.truncated,
          mediaUrl: load.mediaUrl,
          customData: load.customData,
          // The viewer's toolbar always hoists into this host's header.
          toolbar: "host",
          onToolbarState,
          onToolbarControls
        })
      ] }),
      treeOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreeDock, style: { width: treeWidth }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTreeResize,
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": t("editorTreeToggle"),
            onPointerDown: onResizeStart,
            onPointerMove: onResizeMove,
            onPointerUp: onResizeEnd,
            onPointerCancel: onResizeEnd
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          TreePanel,
          {
            sessionId: scope.sessionId,
            cwd: scope.cwd,
            expanded,
            onToggle: onToggleDir,
            onOpenFile: openFile,
            onOpenFileNewTab: openFileNewTab,
            onOpenFileSide: openFileSide,
            onReferenceFile
          }
        )
      ] })
    ] })
  ] });
}
function EditorPathInput(props) {
  const { path, cwd, onOpen } = props;
  const display = path === "" ? "" : relativeTo(cwd ?? "", path);
  const [value, setValue] = (0, import_react4.useState)(display);
  const commit = () => {
    const input = value.trim();
    if (input === "" || input === display) {
      setValue(display);
      return;
    }
    onOpen(resolveSidebarPath(cwd, input));
    setValue(display);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "input",
    {
      className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPathInput,
      value,
      placeholder: t("editorPathPlaceholder"),
      title: path,
      spellCheck: false,
      onChange: (event) => {
        setValue(event.target.value);
      },
      onKeyDown: (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        } else if (event.key === "Escape") {
          setValue(display);
        }
      },
      onBlur: () => {
        setValue(display);
      }
    }
  );
}

// src/client/lazy-chunk.tsx
var import_react6 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
function LazyChunkView({ chunk, pick, props }) {
  const [attempt, setAttempt] = (0, import_react6.useState)(0);
  const [state, setState] = (0, import_react6.useState)({ status: "loading" });
  (0, import_react6.useEffect)(() => {
    let cancelled = false;
    setState({ status: "loading" });
    loadChunk(chunk).then((mod) => {
      if (cancelled) return;
      const Comp = pick(mod);
      if (Comp === void 0) {
        setState({ status: "error", message: `[dsh-better-sidebar] chunk "${chunk}" is missing its component` });
        return;
      }
      setState({ status: "ready", Comp });
    }).catch((error) => {
      if (cancelled) return;
      setState({ status: "error", message: error instanceof Error ? error.message : String(error) });
    });
    return () => {
      cancelled = true;
    };
  }, [chunk, pick, attempt]);
  if (state.status === "loading") {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPlaceholder, children: t("loading") });
  }
  if (state.status === "error") {
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorError, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: state.message }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.terminalRetry,
          onClick: () => {
            setAttempt((current) => current + 1);
          },
          children: t("terminalRetry")
        }
      )
    ] });
  }
  return (0, import_react6.createElement)(state.Comp, props);
}
function lazyChunkComponent(chunk, pick) {
  return (props) => (0, import_react6.createElement)(
    LazyChunkView,
    { chunk, pick, props }
  );
}

// src/client/GitView.tsx
var import_react7 = require("react");
var import_dsh_client_ui_primitives5 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime7 = require("react/jsx-runtime");
function badgeOf(entry) {
  const index = entry.xy[0];
  const worktree = entry.xy[1];
  if (index !== void 0 && index !== " " && index !== "?") return index;
  if (worktree !== void 0 && worktree !== " " && worktree !== "?") return worktree;
  return "?";
}
function isStagedEntry(entry) {
  const index = entry.xy[0];
  return index !== void 0 && index !== " " && index !== "?";
}
function isUnstagedEntry(entry) {
  if (entry.xy === "??") return true;
  const worktree = entry.xy[1];
  return worktree !== void 0 && worktree !== " " && worktree !== "?";
}
function isUntracked(entry) {
  return badgeOf(entry) === "?";
}
function baseName2(path) {
  const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return at === -1 ? path : path.slice(at + 1);
}
function refNames(refs) {
  return [...new Set(
    refs.split(",").map((ref) => ref.trim()).filter((ref) => ref !== "").map((ref) => ref.includes(" -> ") ? ref.slice(ref.indexOf(" -> ") + 4) : ref).map((ref) => ref.startsWith("tag: ") ? ref.slice(5) : ref)
  )];
}
var LOG_BATCH = 20;
function GitView(props) {
  const { scope, onOpenFile, onOpenDiff } = props;
  const [status, setStatus] = (0, import_react7.useState)(null);
  const [loading, setLoading] = (0, import_react7.useState)(true);
  const [error, setError] = (0, import_react7.useState)(null);
  const [branchNames, setBranchNames] = (0, import_react7.useState)([]);
  const [logEntries, setLogEntries] = (0, import_react7.useState)([]);
  const [commitMsg, setCommitMsg] = (0, import_react7.useState)("");
  const [busy, setBusy] = (0, import_react7.useState)(false);
  const [commitError, setCommitError] = (0, import_react7.useState)(null);
  const [logEnded, setLogEnded] = (0, import_react7.useState)(false);
  const [logLoadingMore, setLogLoadingMore] = (0, import_react7.useState)(false);
  const [fileMenu, setFileMenu] = (0, import_react7.useState)(null);
  const [historyMenu, setHistoryMenu] = (0, import_react7.useState)(null);
  const [confirm, setConfirm] = (0, import_react7.useState)(null);
  const refresh = (0, import_react7.useCallback)(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusResult, branchResult, logResult] = await Promise.all([
        api.gitStatus(scope),
        api.gitBranch(scope).catch(() => ({ current: "", names: [] })),
        // The first history page only; the rest arrives via "load more".
        api.gitLog(scope, LOG_BATCH, 0).catch(() => [])
      ]);
      setStatus(statusResult);
      setBranchNames(branchResult.names);
      setLogEntries(logResult);
      setLogEnded(logResult.length < LOG_BATCH);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, [scope.sessionId, scope.cwd]);
  (0, import_react7.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const loadMoreLog = async () => {
    if (logLoadingMore || logEnded) return;
    setLogLoadingMore(true);
    try {
      const next = await api.gitLog(scope, LOG_BATCH, logEntries.length);
      setLogEntries((entries) => [...entries, ...next]);
      if (next.length < LOG_BATCH) setLogEnded(true);
    } catch (reason) {
      setCommitError(`${t("historyLoadError")}: ${reason instanceof Error ? reason.message : String(reason)}`);
    } finally {
      setLogLoadingMore(false);
    }
  };
  const openWorktreeDiff = (entry, staged) => {
    onOpenDiff({
      id: `diff:w:${staged ? "s" : "u"}:${entry.path}`,
      type: "diff",
      title: baseName2(entry.path),
      diff: { kind: "worktree", path: entry.path, staged, untracked: isUntracked(entry) }
    });
  };
  const openCommitDiff = (entry) => {
    onOpenDiff({
      id: `diff:c:${entry.hashFull}`,
      type: "diff",
      title: `${entry.hash} ${entry.subject}`,
      diff: { kind: "commit", hash: entry.hash, hashFull: entry.hashFull, subject: entry.subject }
    });
  };
  const stageEntry = async (entry, staged) => {
    setBusy(true);
    try {
      if (staged) await api.gitUnstage(scope, entry.path);
      else await api.gitStage(scope, entry.path);
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  const stageAll = async (staged) => {
    setBusy(true);
    try {
      if (staged) await api.gitUnstage(scope);
      else await api.gitStage(scope);
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  const commit = async () => {
    const message = commitMsg.trim();
    if (message === "" || busy) return;
    setBusy(true);
    setCommitError(null);
    try {
      await api.gitCommit(scope, message);
      setCommitMsg("");
      await refresh();
    } catch (reason) {
      setCommitError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  };
  const checkout = async (branch) => {
    if (branch === status?.branch || busy) return;
    setBusy(true);
    setCommitError(null);
    try {
      await api.gitCheckout(scope, branch);
      await refresh();
    } catch (reason) {
      setCommitError(`${t("checkoutError")}: ${reason instanceof Error ? reason.message : String(reason)}`);
    } finally {
      setBusy(false);
    }
  };
  const runConfirmed = (confirmState) => {
    setConfirm({ ...confirmState, onConfirm: async () => {
      setBusy(true);
      setCommitError(null);
      try {
        await confirmState.onConfirm();
        await refresh();
      } catch (reason) {
        setCommitError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        setBusy(false);
      }
    } });
  };
  const copy = (text) => {
    void (0, import_dsh_client_ui_primitives5.writeClipboard)(text);
  };
  const openFileMenu = (event, entry, staged) => {
    event.preventDefault();
    event.stopPropagation();
    setFileMenu({ entry, staged, x: event.clientX, y: event.clientY });
  };
  const openHistoryMenu = (event, entry) => {
    event.preventDefault();
    event.stopPropagation();
    setHistoryMenu({ entry, x: event.clientX, y: event.clientY });
  };
  const stagedEntries = (status?.entries ?? []).filter(isStagedEntry);
  const unstagedEntries = (status?.entries ?? []).filter(isUnstagedEntry);
  const renderEntry = (entry, staged) => {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitRowMain,
          title: entry.path,
          onClick: () => {
            openWorktreeDiff(entry, staged);
          },
          onContextMenu: (event) => {
            openFileMenu(event, entry, staged);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitBadge, children: badgeOf(entry) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitName, children: entry.path })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": staged ? t("unstage") : t("stage"),
          title: staged ? t("unstage") : t("stage"),
          disabled: busy,
          onClick: () => {
            void stageEntry(entry, staged);
          },
          children: staged ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconTrashOutline16, {}) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconBranchOutline16, {})
        }
      )
    ] }, `${staged ? "s" : "u"}:${entry.path}`);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.git, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        "select",
        {
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitBranchSelect,
          value: status?.branch ?? "",
          onChange: (event) => {
            void checkout(event.target.value);
          },
          disabled: busy || status !== null && !status.isRepo,
          children: [
            (status?.branch ?? "") !== "" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: status.branch, children: status.branch }),
            branchNames.filter((name) => name !== status?.branch).map((name) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: name, children: name }, name))
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          onClick: () => {
            void refresh();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconRefreshOutline16, { size: 14 })
        }
      )
    ] }),
    loading && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitPlaceholder, children: t("loading") }),
    !loading && error !== null && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitError, children: error }),
    !loading && status !== null && !status.isRepo && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitPlaceholder, children: t("notRepo") }),
    status !== null && status.isRepo && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSectionHeader, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
            t("staged"),
            " (",
            stagedEntries.length,
            ")"
          ] }),
          stagedEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLink, disabled: busy, onClick: () => {
            void stageAll(true);
          }, children: t("unstageAll") })
        ] }),
        stagedEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitEmpty, children: t("noChanges") }),
        stagedEntries.map((entry) => renderEntry(entry, true))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSectionHeader, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { children: [
            t("unstaged"),
            " (",
            unstagedEntries.length,
            ")"
          ] }),
          unstagedEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLink, disabled: busy, onClick: () => {
            void stageAll(false);
          }, children: t("stageAll") })
        ] }),
        unstagedEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitEmpty, children: t("noChanges") }),
        unstagedEntries.map((entry) => renderEntry(entry, false))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitCommit, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          import_dsh_client_ui_primitives5.Input,
          {
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitCommitInput,
            placeholder: t("commitPlaceholder"),
            value: commitMsg,
            disabled: busy,
            onChange: (event) => {
              setCommitMsg(event.target.value);
              setCommitError(null);
            },
            onKeyDown: (event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") void commit();
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitCommitButton,
            disabled: busy || commitMsg.trim() === "" || stagedEntries.length === 0,
            onClick: () => {
              void commit();
            },
            children: t("commit")
          }
        )
      ] }),
      commitError !== null && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitError, children: commitError }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitSectionHeader, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("history") }) }),
        logEntries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "div",
          {
            role: "button",
            tabIndex: 0,
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogRow,
            title: `${entry.author} \xB7 ${entry.date}
${entry.hashFull}`,
            onClick: () => {
              openCommitDiff(entry);
            },
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCommitDiff(entry);
              }
            },
            onContextMenu: (event) => {
              openHistoryMenu(event, entry);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogLine1, children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogHash, children: entry.hash }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogSubject, children: entry.subject })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogLine2, children: [
                refNames(entry.refs).map((ref) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogRef, children: ref }, ref)),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogMeta, children: [
                  entry.author,
                  " \xB7 ",
                  relativeTime(entry.date)
                ] })
              ] })
            ]
          },
          entry.hashFull
        )),
        !logEnded && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitLogMore,
            disabled: logLoadingMore || busy,
            onClick: () => {
              void loadMoreLog();
            },
            children: logLoadingMore ? t("loading") : t("loadMore")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        import_dsh_client_ui_primitives5.Menu,
        {
          open: fileMenu !== null,
          onClose: () => {
            setFileMenu(null);
          },
          items: [
            { id: "open", label: t("openEditor"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCodeOutline16, { size: 14 }) },
            fileMenu?.staged === true ? { id: "stage", label: t("unstage"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconTrashOutline16, { size: 14 }) } : { id: "stage", label: t("stage"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconBranchOutline16, { size: 14 }) },
            ...fileMenu !== null && !isUntracked(fileMenu.entry) ? [{ id: "discard", label: t("discard"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconTrashOutline16, { size: 14 }), danger: true }] : [],
            { type: "separator", id: "sep1" },
            { id: "relative", label: t("copyRelative"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCopyOutline16, { size: 14 }) },
            { id: "absolute", label: t("copyAbsolute"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCopyOutline16, { size: 14 }) }
          ],
          onSelect: (id) => {
            const target = fileMenu;
            if (target === null) return;
            setFileMenu(null);
            if (id === "open") {
              onOpenFile(target.entry.path);
              return;
            }
            if (id === "stage") {
              void stageEntry(target.entry, target.staged);
              return;
            }
            if (id === "discard") {
              runConfirmed({
                title: t("discardTitle"),
                description: t("discardDesc", { path: target.entry.path }),
                confirmLabel: t("discard"),
                onConfirm: () => api.gitDiscard(scope, target.entry.path)
              });
              return;
            }
            if (id === "relative") {
              copy(relativeTo(scope.cwd ?? "", target.entry.path));
              return;
            }
            if (id === "absolute") copy(target.entry.path);
          },
          portal: true,
          align: "start",
          getAnchorRect: () => fileMenu === null ? null : new DOMRect(fileMenu.x, fileMenu.y, 0, 0),
          anchor: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        import_dsh_client_ui_primitives5.Menu,
        {
          open: historyMenu !== null,
          onClose: () => {
            setHistoryMenu(null);
          },
          items: [
            { id: "view", label: t("viewCommitDiff") },
            { id: "copyShort", label: t("copyShortHash"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCopyOutline16, { size: 14 }) },
            { id: "copyFull", label: t("copyFullHash"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCopyOutline16, { size: 14 }) },
            { id: "copySubject", label: t("copySubject"), icon: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.IconCopyOutline16, { size: 14 }) },
            { type: "separator", id: "sep2" },
            { id: "revert", label: t("revertCommit"), danger: true },
            { id: "cherryPick", label: t("cherryPickCommit"), danger: true }
          ],
          onSelect: (id) => {
            const target = historyMenu;
            if (target === null) return;
            setHistoryMenu(null);
            if (id === "view") {
              openCommitDiff(target.entry);
              return;
            }
            if (id === "copyShort") {
              copy(target.entry.hash);
              return;
            }
            if (id === "copyFull") {
              copy(target.entry.hashFull);
              return;
            }
            if (id === "copySubject") {
              copy(target.entry.subject);
              return;
            }
            if (id === "revert") {
              runConfirmed({
                title: t("revertTitle"),
                description: t("revertDesc", { subject: target.entry.subject }),
                confirmLabel: t("revertCommit"),
                onConfirm: () => api.gitRevert(scope, target.entry.hashFull)
              });
              return;
            }
            if (id === "cherryPick") {
              runConfirmed({
                title: t("cherryPickTitle"),
                description: t("cherryPickDesc", { subject: target.entry.subject }),
                confirmLabel: t("cherryPickCommit"),
                onConfirm: () => api.gitCherryPick(scope, target.entry.hashFull)
              });
            }
          },
          portal: true,
          align: "start",
          getAnchorRect: () => historyMenu === null ? null : new DOMRect(historyMenu.x, historyMenu.y, 0, 0),
          anchor: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        import_dsh_client_ui_primitives5.Modal,
        {
          open: confirm !== null,
          onClose: () => {
            setConfirm(null);
          },
          title: confirm?.title ?? "",
          closeLabel: t("cancel"),
          footer: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_dsh_client_ui_primitives5.Button, { variant: "outline", onClick: () => {
              setConfirm(null);
            }, children: t("cancel") }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              import_dsh_client_ui_primitives5.Button,
              {
                variant: "primary",
                disabled: busy,
                onClick: () => {
                  const pending = confirm;
                  if (pending === null) return;
                  setConfirm(null);
                  void pending.onConfirm();
                },
                children: confirm?.confirmLabel ?? ""
              }
            )
          ] }),
          children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitConfirmDesc, children: confirm?.description })
        }
      )
    ] })
  ] });
}

// src/client/DiffTab.tsx
var import_react9 = require("react");
var import_dsh_client_ui_primitives6 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/DiffView.tsx
var import_react8 = require("react");
var import_jsx_runtime8 = require("react/jsx-runtime");
function parseHunkHeader(line) {
  const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
  if (match === null) return null;
  return { oldStart: Number(match[1]), newStart: Number(match[3]), header: match[5] ?? "" };
}
function parseUnifiedDiff(text) {
  const files = [];
  let current = null;
  let inHunk = false;
  let hunk = null;
  let oldNum = 0;
  let newNum = 0;
  const flushHunk = () => {
    if (current !== null && hunk !== null) current.hunks.push(hunk);
    hunk = null;
    inHunk = false;
  };
  for (const raw of text.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      flushHunk();
      current = { oldPath: "", newPath: "", binary: false, hunks: [] };
      files.push(current);
      continue;
    }
    if (current === null) continue;
    if (raw.startsWith("Binary files ") || raw === "GIT binary patch") {
      flushHunk();
      current.binary = true;
      continue;
    }
    if (raw.startsWith("--- ")) {
      flushHunk();
      current.oldPath = raw.slice(4);
      continue;
    }
    if (raw.startsWith("+++ ")) {
      current.newPath = raw.slice(4);
      continue;
    }
    const header = parseHunkHeader(raw);
    if (header !== null) {
      flushHunk();
      hunk = { oldStart: header.oldStart, newStart: header.newStart, header: header.header, lines: [] };
      oldNum = header.oldStart;
      newNum = header.newStart;
      inHunk = true;
      continue;
    }
    if (!inHunk || hunk === null) continue;
    const marker = raw[0];
    if (marker === "\\") {
      hunk.lines.push({ kind: "meta", text: raw.slice(1), oldNum: null, newNum: null });
      continue;
    }
    if (marker === " ") {
      hunk.lines.push({ kind: "ctx", text: raw.slice(1), oldNum, newNum });
      oldNum += 1;
      newNum += 1;
    } else if (marker === "-") {
      hunk.lines.push({ kind: "del", text: raw.slice(1), oldNum, newNum: null });
      oldNum += 1;
    } else if (marker === "+") {
      hunk.lines.push({ kind: "add", text: raw.slice(1), oldNum: null, newNum });
      newNum += 1;
    } else {
      flushHunk();
    }
  }
  flushHunk();
  return { files };
}
function untrackedFile(path, content) {
  const lines = [];
  const body = content.endsWith("\n") ? content.slice(0, -1) : content;
  if (body !== "") {
    let num = 1;
    for (const line of body.split("\n")) {
      lines.push({ kind: "add", text: line, oldNum: null, newNum: num });
      num += 1;
    }
  }
  return { oldPath: "/dev/null", newPath: `b/${path}`, binary: false, hunks: [{ oldStart: 0, newStart: 1, header: "", lines }] };
}
function displayPath(path) {
  if (path === "/dev/null") return path;
  if (path.startsWith("a/") || path.startsWith("b/")) return path.slice(2);
  return path;
}
function fileTag(file) {
  if (file.binary) return t("diffBinary");
  if (file.oldPath === "/dev/null") return t("diffAdded");
  if (file.newPath === "/dev/null") return t("diffDeleted");
  const oldPath = displayPath(file.oldPath);
  const newPath = displayPath(file.newPath);
  if (oldPath !== newPath) return t("diffRenamed");
  return null;
}
var MAX_DIFF_ROWS = 500;
function DiffView({ diff, untrackedPath, untrackedContent }) {
  const parsed = (0, import_react8.useMemo)(() => {
    if (untrackedPath !== void 0) {
      return { files: [untrackedFile(untrackedPath, untrackedContent ?? "")] };
    }
    return parseUnifiedDiff(diff);
  }, [diff, untrackedPath, untrackedContent]);
  const [expanded, setExpanded] = (0, import_react8.useState)(false);
  const rows = (0, import_react8.useMemo)(() => {
    const out = [];
    parsed.files.forEach((file, fileIndex) => {
      out.push({ key: `f${fileIndex}`, file, type: "path" });
      if (file.binary) return;
      file.hunks.forEach((hunk, hunkIndex) => {
        out.push({ key: `f${fileIndex}h${hunkIndex}`, file, type: "hunk", hunk });
        hunk.lines.forEach((line, lineIndex) => {
          out.push({ key: `f${fileIndex}h${hunkIndex}l${lineIndex}`, file, type: "line", hunk, line });
        });
      });
    });
    return out;
  }, [parsed]);
  const hidden = rows.length - MAX_DIFF_ROWS;
  const capped = hidden > 0 && !expanded;
  const headLines = Math.ceil(MAX_DIFF_ROWS / 2);
  const tailLines = MAX_DIFF_ROWS - headLines;
  const head = capped ? rows.slice(0, headLines) : rows;
  const tail = capped ? rows.slice(rows.length - tailLines) : [];
  if (rows.length === 0) return null;
  const renderRow = (row) => {
    if (row.type === "path") {
      const tag = fileTag(row.file);
      const from = displayPath(row.file.oldPath);
      const to = displayPath(row.file.newPath);
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffFile, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffFilePath, children: to }),
        from !== to && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffFileOld, children: [
          "\u2190 ",
          from
        ] }),
        tag !== null && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffFileTag, children: tag })
      ] }, row.key);
    }
    if (row.type === "hunk") {
      const hunk = row.hunk;
      return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffHunk, children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffHunkHeader, children: [
          "@@ -",
          hunk.oldStart,
          ",",
          hunk.lines.filter((l) => l.oldNum !== null).length,
          " +",
          hunk.newStart,
          ",",
          hunk.lines.filter((l) => l.newNum !== null).length,
          " @@"
        ] }),
        hunk.header !== "" && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffHunkSection, children: hunk.header })
      ] }, row.key);
    }
    const line = row.line;
    const lineClass = line.kind === "del" ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffDel : line.kind === "add" ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffAdd : line.kind === "meta" ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffMeta : dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffCtx;
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffLine, lineClass), children: line.kind === "meta" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffMetaText, children: line.text }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffNum, children: line.oldNum ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffNum, children: line.newNum ?? "" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffCode, children: line.text })
    ] }) }, row.key);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiff, children: [
    head.map(renderRow),
    hidden > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffExpand, "aria-expanded": expanded, onClick: () => {
      setExpanded((value) => !value);
    }, children: expanded ? t("diffCollapse") : t("diffExpand", { count: hidden }) }),
    tail.map(renderRow)
  ] });
}

// src/client/DiffTab.tsx
var import_jsx_runtime9 = require("react/jsx-runtime");
function DiffTab(props) {
  const { sessionId, cwd, diff } = props;
  const [loading, setLoading] = (0, import_react9.useState)(true);
  const [error, setError] = (0, import_react9.useState)(null);
  const [data, setData] = (0, import_react9.useState)(null);
  const [tick, setTick] = (0, import_react9.useState)(0);
  const refresh = (0, import_react9.useCallback)(() => {
    setTick((value) => value + 1);
  }, []);
  (0, import_react9.useEffect)(() => {
    let cancelled = false;
    const scope = { sessionId, cwd };
    setLoading(true);
    setError(null);
    setData(null);
    const load = async () => {
      try {
        if (diff.kind === "commit") {
          const result2 = await api.gitCommitDiff(scope, diff.hashFull);
          if (!cancelled) setData({ diff: result2.diff });
          return;
        }
        let result = await api.gitDiff(scope, diff.path, diff.staged);
        if (result.diff === "") {
          const other = await api.gitDiff(scope, diff.path, !diff.staged);
          if (other.diff !== "") result = other;
        }
        if (result.diff !== "") {
          if (!cancelled) setData({ diff: result.diff });
          return;
        }
        if (diff.untracked === true && !diff.staged) {
          const text = await api.fsRead(scope, diff.path);
          if (!cancelled) {
            setData(text.kind === "text" ? { diff: "", untracked: text.content } : { diff: "" });
          }
          return;
        }
        if (!cancelled) setData({ diff: "" });
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, cwd, diff, tick]);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffTab, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffTabHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitDiffTabTitle, title: diff.kind === "worktree" ? diff.path : `${diff.hash} ${diff.subject}`, children: diff.kind === "worktree" ? diff.path : `${diff.hash} ${diff.subject}` }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          onClick: refresh,
          children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(import_dsh_client_ui_primitives6.IconRefreshOutline16, { size: 14 })
        }
      )
    ] }),
    loading && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitPlaceholder, children: t("loading") }),
    !loading && error !== null && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitError, children: [
      t("diffLoadError"),
      ": ",
      error
    ] }),
    !loading && error === null && data !== null && /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
      data.untracked !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DiffView, { diff: "", untrackedPath: diff.kind === "worktree" ? diff.path : "", untrackedContent: data.untracked }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DiffView, { diff: data.diff }),
      data.diff === "" && data.untracked === void 0 && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.gitEmpty, children: t("diffEmpty") })
    ] })
  ] });
}

// src/client/SubagentView.tsx
var import_react10 = require("react");
var import_react11 = require("react");
var import_dsh_client_ui_primitives7 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/subagent-detect.ts
function directSubagentCount(byId, sessionId) {
  let count = 0;
  for (const summary of Object.values(byId)) {
    if (summary.origin === "subagent" && summary.parentId === sessionId) count += 1;
  }
  return count;
}
function rootAncestor(byId, sessionId) {
  if (sessionId === void 0) return void 0;
  const seen = /* @__PURE__ */ new Set();
  let current = byId[sessionId];
  while (current !== void 0 && current.origin === "subagent" && current.parentId !== void 0 && !seen.has(current.id)) {
    seen.add(current.id);
    current = byId[current.parentId];
  }
  return current?.id ?? sessionId;
}
function collectBranchIds(catalogs, rootId) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const visit = (parentId) => {
    if (seen.has(parentId)) return;
    seen.add(parentId);
    for (const entry of catalogs[parentId]?.entries ?? []) {
      if (entry.kind === "child" && entry.hasChildren) {
        out.push(entry.id);
        visit(entry.id);
      }
    }
  };
  if (rootId !== void 0) visit(rootId);
  return out;
}
function detectNewDirectSubagent(prev, next, sessionId) {
  return directSubagentCount(prev.byId, sessionId) === 0 && directSubagentCount(next.byId, sessionId) > 0;
}
function countSubagentDescendants(byId, sessionId) {
  const totals = { count: 0, runningCount: 0 };
  for (const descendant of Object.values(byId)) {
    if (descendant.origin !== "subagent") continue;
    const seen = /* @__PURE__ */ new Set();
    let current = descendant;
    while (current?.origin === "subagent" && current.parentId !== void 0 && !seen.has(current.id)) {
      seen.add(current.id);
      if (current.parentId === sessionId) {
        totals.count += 1;
        if (descendant.running === true) totals.runningCount += 1;
        break;
      }
      current = byId[current.parentId];
    }
  }
  return totals;
}

// src/client/subagent-activity.ts
function contentText(content) {
  if (!Array.isArray(content)) return void 0;
  const parts = [];
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    const candidate = block;
    if (candidate.type === "text" && typeof candidate.text === "string") {
      parts.push(candidate.text);
    }
  }
  return parts.length > 0 ? parts.join("\n") : void 0;
}
function lastActivity(entries) {
  let text;
  let tool;
  for (const entry of entries) {
    const { type, data } = entry.event;
    if (type === "assistant/message") {
      const message = data.message;
      const extracted = contentText(message?.content);
      if (extracted !== void 0) text = extracted;
    } else if (type === "tool/call") {
      tool = {
        name: typeof data.name === "string" ? data.name : "tool",
        args: typeof data.arguments === "string" ? data.arguments : ""
      };
    }
  }
  if (text === void 0 && tool === void 0) return {};
  return {
    ...text === void 0 ? {} : { text },
    ...tool === void 0 ? {} : { tool }
  };
}

// src/client/subagent-jobs.ts
function isJobLive(job) {
  return job.status === "running" || job.status === "stopping";
}
function treeSessionIds(byId, rootId) {
  const ids = /* @__PURE__ */ new Set();
  if (rootId === void 0) return ids;
  for (const summary of Object.values(byId)) {
    const seen = /* @__PURE__ */ new Set();
    let current = summary;
    let reachesRoot = false;
    while (current !== void 0 && !seen.has(current.id)) {
      seen.add(current.id);
      if (current.id === rootId) {
        reachesRoot = true;
        break;
      }
      if (current.origin !== "subagent" || current.parentId === void 0) break;
      current = byId[current.parentId];
    }
    if (reachesRoot) ids.add(summary.id);
  }
  return ids;
}
function detectNewJob(prev, next, sessionId) {
  const prevIds = new Set((prev.jobsBySession?.[sessionId] ?? []).map((job) => job.id));
  return (next.jobsBySession?.[sessionId] ?? []).some((job) => !prevIds.has(job.id));
}
function collectTreeJobs(byId, jobsBySession, rootId) {
  const rows = [];
  if (jobsBySession === void 0) return rows;
  for (const sessionId of treeSessionIds(byId, rootId)) {
    const jobs = jobsBySession[sessionId];
    if (jobs === void 0 || jobs.length === 0) continue;
    const ownerTitle = byId[sessionId]?.displayTitle ?? sessionId;
    for (const job of jobs) rows.push({ ownerSessionId: sessionId, ownerTitle, job });
  }
  return rows;
}
function orderJobs(rows) {
  return [...rows].sort((left, right) => {
    const liveLeft = isJobLive(left.job);
    if (liveLeft !== isJobLive(right.job)) return liveLeft ? -1 : 1;
    if (liveLeft) return left.job.startedAt - right.job.startedAt;
    const finished = (right.job.finishedAt ?? right.job.startedAt) - (left.job.finishedAt ?? left.job.startedAt);
    return finished !== 0 ? finished : left.job.startedAt - right.job.startedAt;
  });
}
function jobDotState(status) {
  switch (status) {
    case "running":
      return "ongoing";
    case "stopping":
      return "warning";
    case "completed":
      return "done";
    case "killed":
      return "warning";
    case "failed":
      return "error";
  }
}
function jobStatusLabel(status, t2) {
  switch (status) {
    case "running":
      return t2("jobStatusRunning");
    case "stopping":
      return t2("jobStatusStopping");
    case "completed":
      return t2("jobStatusCompleted");
    case "killed":
      return t2("jobStatusKilled");
    case "failed":
      return t2("jobStatusFailed");
  }
}
function formatJobDuration(elapsedMs, t2) {
  const total = Math.max(0, Math.floor(elapsedMs / 1e3));
  const seconds = total % 60;
  const minutes = Math.floor(total / 60) % 60;
  const hours = Math.floor(total / 3600);
  if (hours > 0) return t2("jobDurationHours", { hours, minutes });
  if (minutes > 0) return t2("jobDurationMinutes", { minutes, seconds });
  return t2("jobDurationSeconds", { seconds });
}

// src/client/icons.tsx
var import_jsx_runtime10 = require("react/jsx-runtime");
var IconPanelRightOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "2", width: "13", height: "12", rx: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "10.5", y: "3.25", width: "2.75", height: "9.5", rx: "1", fill: "currentColor", stroke: "none" })
] });
var IconPanelBottomOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "2", width: "13", height: "12", rx: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "3.25", y: "10", width: "9.5", height: "2.75", rx: "1", fill: "currentColor", stroke: "none" })
] });
var IconPanelSwapOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M2.5 5h9M9.5 2.75 12 5 9.5 7.25M13.5 11h-9M6.5 8.75 4 11l2.5 2.25", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
var IconTerminalOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M4.5 6.25 6.75 8 4.5 9.75", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8.5 10.4h3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
] });
var IconDiffOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "1.5", width: "13", height: "13", rx: "2.5", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M4 5h3M5.5 3.5v3", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M9.5 12.5h2.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
] });
var IconStopOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "4", y: "4", width: "8", height: "8", rx: "1.5", fill: "currentColor", stroke: "none" }) });
var IconImageOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "5.5", cy: "6", r: "1.2", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "m3.5 12 3-3 2.25 2.25L11.5 8.5 13 10.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var IconPdfOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M3.5 1.5h6.5L13.5 5v9.5h-10z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M9.5 1.5V5h4", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5 13.5v-3h1.4c.75 0 1.1.32 1.1.85 0 .54-.35.85-1.1.85H5.3", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M8.3 13.5v-3h1.05c.8 0 1.35.5 1.35 1.5s-.55 1.5-1.35 1.5z", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M11.6 13.5v-3h1.3", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round" })
] });
var IconMarkdownOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M4 10.5V5.5l2 2.5 2-2.5v5M9.5 10.5v-5l2 2.5 2-2.5v5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var IconHtmlOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M3.5 1.5h6.5L13.5 5v9.5h-10z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M9.5 1.5V5h4", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M5.6 13.2 4.2 10l1.4-3.2M7.4 6.8 8.8 10l-1.4 3.2", stroke: "currentColor", strokeWidth: "1.25", strokeLinecap: "round", strokeLinejoin: "round" })
] });
var IconGlobeOutline16 = ({ size = 16, className }) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("svg", { width: size, height: size, className, viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("circle", { cx: "8", cy: "8", r: "6.5", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("ellipse", { cx: "8", cy: "8", rx: "2.8", ry: "6.5", stroke: "currentColor", strokeWidth: "1.5" }),
  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "M1.5 8h13M8 1.5c-2.4 1.8-2.4 11.2 0 13M8 1.5c2.4 1.8 2.4 11.2 0 13", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
] });

// dshinline: dsh-inline:D%3A%5C%E5%B7%A5%E4%BD%9C%5CAI%E6%96%87%E4%BB%B6%5Cdeepseek%20harness%5Cdsh-better-sidebar%5Csrc%5Cclient%5CSubagentView.module.css.mjs
var css2 = '.QefZ6a_subagent{flex-direction:column;flex:1;min-height:0;display:flex}.QefZ6a_subagentHeader{flex:none;align-items:center;gap:8px;height:36px;padding:0 8px 0 12px;display:flex}.QefZ6a_subagentTitle{min-width:0;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.QefZ6a_subagentCount{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);flex:none}.QefZ6a_subagentRefresh{width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;justify-content:center;align-items:center;display:inline-flex}.QefZ6a_subagentRefresh:hover{background:var(--dsw-alias-interactive-bg-hover)}.QefZ6a_subagentBody{flex:1;min-height:0;padding:2px 6px 8px;overflow-y:auto}.QefZ6a_subagentRow{box-sizing:border-box;width:100%;min-height:50px;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:none;border-radius:8px;outline:none;align-items:flex-start;gap:8px;padding:7px 8px 7px 11px;display:flex;position:relative}.QefZ6a_subagentRow:hover,.QefZ6a_subagentRow:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.QefZ6a_subagentRowActive,.QefZ6a_subagentRowActive:hover,.QefZ6a_subagentRowActive:focus-visible{background:var(--dsw-alias-interactive-bg-active)}.QefZ6a_subagentRowDisabled{color:var(--dsw-alias-label-dimmed);cursor:not-allowed}.QefZ6a_subagentRowDisabled:hover{background:0 0}.QefZ6a_subagentRowLoading{cursor:default}.QefZ6a_subagentDot{margin-top:4px}.QefZ6a_subagentContent{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.QefZ6a_subagentLabel,.QefZ6a_subagentSecondary{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.QefZ6a_subagentLabel{color:inherit;font-weight:400}.QefZ6a_subagentSecondary{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary)}.QefZ6a_subagentLive{min-width:0;font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);align-items:baseline;gap:4px;display:flex;overflow:hidden}.QefZ6a_subagentLiveTool{font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-secondary);flex:none}.QefZ6a_subagentLiveArgs{min-width:0;font-family:var(--ds-font-family-code);font-size:var(--dsw-font-xxxs-11-font-size);line-height:var(--dsw-font-xxxs-11-line-height);color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.QefZ6a_subagentLiveText{-webkit-line-clamp:2;font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-secondary);-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.QefZ6a_subagentNode{min-width:0;position:relative}.QefZ6a_subagentChildren{margin-left:18px;padding-left:4px;position:relative}.QefZ6a_subagentChildren:before{content:"";border-left:1px solid var(--dsw-alias-border-l2);height:26px;position:absolute;top:-26px;left:0}.QefZ6a_subagentChildren[aria-busy=true]:before{content:none}.QefZ6a_subagentChildren>.QefZ6a_subagentNode:before{content:"";border-left:1px solid var(--dsw-alias-border-l2);position:absolute;top:0;bottom:0;left:-4px}.QefZ6a_subagentChildren>.QefZ6a_subagentNode:last-child:before{height:17px;bottom:auto}.QefZ6a_subagentChildren>.QefZ6a_subagentNode>.QefZ6a_subagentRow:before{content:"";border-top:1px solid var(--dsw-alias-border-l2);width:14px;position:absolute;top:16px;left:-4px}.QefZ6a_subagentEmpty{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);text-align:center;flex-direction:column;gap:2px;padding:16px;display:flex}.QefZ6a_subagentEmptyHint{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-dimmed)}.QefZ6a_subagentError{font:var(--dsw-font-xxs-12);color:var(--dsw-alias-state-error-primary);justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;display:flex}.QefZ6a_subagentErrorRetry{height:24px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxxs-strong-11);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;align-items:center;gap:4px;padding:0 8px;display:inline-flex}.QefZ6a_subagentErrorRetry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.QefZ6a_jobs{border-top:1px solid var(--dsw-alias-border-l2);margin-top:10px;padding-top:8px}.QefZ6a_jobsHeader{align-items:center;gap:8px;height:26px;padding:0 2px;display:flex}.QefZ6a_jobsTitle{min-width:0;font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.QefZ6a_jobsCount{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);flex:none}.QefZ6a_jobsList{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.QefZ6a_jobsRow{border-radius:8px;align-items:center;gap:4px;display:flex}.QefZ6a_jobsRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.QefZ6a_jobsRowSettled{opacity:.8}.QefZ6a_jobsRowSelected,.QefZ6a_jobsRowSelected:hover{background:var(--dsw-alias-interactive-bg-active)}.QefZ6a_jobsRowMain{min-width:0;font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;background:0 0;border:none;border-radius:8px;outline:none;flex:1;align-items:flex-start;gap:8px;padding:6px 8px 6px 11px;display:flex}.QefZ6a_jobsRowMain:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.QefZ6a_jobsDot{margin-top:5px}.QefZ6a_jobsContent{flex-direction:column;gap:1px;min-width:0;display:flex}.QefZ6a_jobsLabelLine{align-items:center;gap:6px;min-width:0;display:flex}.QefZ6a_jobsKind{text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--dsw-alias-border-l2);max-width:90px;font:var(--dsw-font-xxxs-strong-11);color:var(--dsw-alias-label-tertiary);border-radius:4px;flex:none;padding:0 5px;line-height:14px;overflow:hidden}.QefZ6a_jobsLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-family:var(--ds-font-family-code);font-size:var(--dsw-font-xxxs-11-font-size);line-height:var(--dsw-font-xxxs-11-line-height);color:var(--dsw-alias-label-primary);flex:1;overflow:hidden}.QefZ6a_jobsSecondary{text-overflow:ellipsis;white-space:nowrap;font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);overflow:hidden}.QefZ6a_jobsKill{width:22px;height:22px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:6px;flex:none;justify-content:center;align-items:center;margin-right:4px;display:inline-flex}.QefZ6a_jobsKill:hover{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);color:var(--dsw-alias-state-error-primary)}.QefZ6a_jobsKillArmed,.QefZ6a_jobsKillArmed:hover{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);width:auto;height:20px;color:var(--dsw-alias-state-error-primary);font:var(--dsw-font-xxxs-strong-11);white-space:nowrap;padding:0 8px}.QefZ6a_jobsKill:disabled{opacity:.5;cursor:default}.QefZ6a_jobsKillError{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-state-error-primary);flex:none;margin-right:4px}.QefZ6a_jobsPane{z-index:1;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:8px;margin-top:4px;position:sticky;bottom:0;overflow:hidden;box-shadow:0 -6px 12px -8px #00000059}.QefZ6a_jobsPaneHeader{border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;gap:6px;height:28px;padding:0 4px 0 10px;display:flex}.QefZ6a_jobsPaneDot{flex:none}.QefZ6a_jobsPaneLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-family:var(--ds-font-family-code);font-size:var(--dsw-font-xxxs-11-font-size);line-height:var(--dsw-font-xxxs-11-line-height);color:var(--dsw-alias-label-primary);flex:1;overflow:hidden}.QefZ6a_jobsPaneStatus{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);flex:none}.QefZ6a_jobsPaneClose{width:20px;height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:5px;flex:none;justify-content:center;align-items:center;display:inline-flex}.QefZ6a_jobsPaneClose:hover{background:var(--dsw-alias-interactive-bg-hover)}.QefZ6a_jobsPanePre{max-height:200px;font-family:var(--ds-font-family-code);font-size:var(--dsw-font-xxxs-11-font-size);color:var(--dsw-alias-label-primary);white-space:pre-wrap;word-break:break-word;margin:0;padding:6px 10px;line-height:1.5;overflow:auto}.QefZ6a_jobsPaneHint{font:var(--dsw-font-xxxs-11);color:var(--dsw-alias-label-tertiary);padding:8px 10px}.QefZ6a_jobsPaneError{color:var(--dsw-alias-state-error-primary)}';
var tagId2 = "dsh-external/dsh-better-sidebar/SubagentView.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId2) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-external/dsh-better-sidebar";
  tag.dataset.pluginCss = tagId2;
  tag.textContent = css2;
  document.head.appendChild(tag);
}
var dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default = { "jobsPanePre": "QefZ6a_jobsPanePre", "jobsList": "QefZ6a_jobsList", "subagentLiveArgs": "QefZ6a_subagentLiveArgs", "subagentEmptyHint": "QefZ6a_subagentEmptyHint", "subagentSecondary": "QefZ6a_subagentSecondary", "subagentHeader": "QefZ6a_subagentHeader", "subagentRowLoading": "QefZ6a_subagentRowLoading", "subagentLiveTool": "QefZ6a_subagentLiveTool", "jobs": "QefZ6a_jobs", "jobsRowSettled": "QefZ6a_jobsRowSettled", "jobsRowMain": "QefZ6a_jobsRowMain", "jobsLabelLine": "QefZ6a_jobsLabelLine", "jobsPaneClose": "QefZ6a_jobsPaneClose", "jobsPaneError": "QefZ6a_jobsPaneError", "jobsTitle": "QefZ6a_jobsTitle", "subagentErrorRetry": "QefZ6a_subagentErrorRetry", "jobsPane": "QefZ6a_jobsPane", "jobsDot": "QefZ6a_jobsDot", "subagentCount": "QefZ6a_subagentCount", "subagentError": "QefZ6a_subagentError", "subagentDot": "QefZ6a_subagentDot", "jobsKind": "QefZ6a_jobsKind", "jobsCount": "QefZ6a_jobsCount", "subagentRow": "QefZ6a_subagentRow", "jobsKillError": "QefZ6a_jobsKillError", "jobsPaneLabel": "QefZ6a_jobsPaneLabel", "subagentLiveText": "QefZ6a_subagentLiveText", "jobsContent": "QefZ6a_jobsContent", "jobsPaneStatus": "QefZ6a_jobsPaneStatus", "jobsRow": "QefZ6a_jobsRow", "jobsHeader": "QefZ6a_jobsHeader", "subagentLive": "QefZ6a_subagentLive", "jobsPaneHeader": "QefZ6a_jobsPaneHeader", "subagentRefresh": "QefZ6a_subagentRefresh", "subagentRowActive": "QefZ6a_subagentRowActive", "subagentBody": "QefZ6a_subagentBody", "subagentChildren": "QefZ6a_subagentChildren", "subagent": "QefZ6a_subagent", "jobsSecondary": "QefZ6a_jobsSecondary", "subagentNode": "QefZ6a_subagentNode", "jobsKillArmed": "QefZ6a_jobsKillArmed", "jobsPaneDot": "QefZ6a_jobsPaneDot", "jobsPaneHint": "QefZ6a_jobsPaneHint", "subagentEmpty": "QefZ6a_subagentEmpty", "subagentTitle": "QefZ6a_subagentTitle", "subagentLabel": "QefZ6a_subagentLabel", "jobsRowSelected": "QefZ6a_jobsRowSelected", "subagentContent": "QefZ6a_subagentContent", "jobsLabel": "QefZ6a_jobsLabel", "jobsKill": "QefZ6a_jobsKill", "subagentRowDisabled": "QefZ6a_subagentRowDisabled" };

// src/client/SubagentView.tsx
var import_jsx_runtime11 = require("react/jsx-runtime");
var POLL_MS = 3e3;
var ARGS_PREVIEW = 60;
var JOB_POLL_MS = 2e3;
var JOB_KILL_ARM_MS = 3e3;
function directChildren(byId, parentSessionId) {
  return Object.values(byId).filter(
    (summary) => summary.origin === "subagent" && summary.parentId === parentSessionId
  );
}
function childLabel(entry, summary) {
  return entry.label ?? summary?.displayTitle ?? entry.id;
}
function diagnosticReason(entry) {
  switch (entry.reason) {
    case "corrupt":
      return t("subagentDiagCorrupt");
    case "unsupported":
      return t("subagentDiagUnsupported");
    case "unavailable":
      return t("subagentDiagUnavailable");
  }
}
function cardSecondary(summary, entry) {
  return [
    summary?.displayTitle,
    entry.mode === "one-shot" ? t("subagentModeOneShot") : t("subagentModeContinuable"),
    entry.activity === "running" ? t("subagentRunning") : t("subagentInactive")
  ].filter(Boolean).join(" \xB7 ");
}
function preview(text, limit) {
  return text.length > limit ? `${text.slice(0, limit)}\u2026` : text;
}
function flatten(text) {
  return text.replace(/\s+/g, " ").trim();
}
function CatalogLoadingRows(props) {
  const { parentSessionId, byId, level } = props;
  const children = directChildren(byId, parentSessionId);
  if (children.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentEmpty, children: t("loading") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_jsx_runtime11.Fragment, { children: children.map((summary) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
    "div",
    {
      role: "treeitem",
      "aria-disabled": "true",
      "aria-level": level,
      "aria-label": t("loading"),
      className: `${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRow} ${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRowDisabled} ${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRowLoading}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.StateDot, { state: summary.running === true ? "ongoing" : "done", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentDot }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentContent, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLabel, children: t("loading") }) })
      ]
    },
    summary.id
  )) });
}
function SubagentLiveLines(props) {
  const { ctx, parentSessionId, childSessionId, mode, running, active } = props;
  const [live, setLive] = (0, import_react10.useState)({});
  const controllerRef = (0, import_react10.useRef)(void 0);
  const address = (0, import_react10.useMemo)(
    () => ({ parentSessionId, childSessionId, mode }),
    [parentSessionId, childSessionId, mode]
  );
  const load = (0, import_react10.useCallback)(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const response = await ctx.connection.api.subagents.history(
        { ...address, maxMessages: 12 },
        controller.signal
      );
      if (!response.result.ok) return;
      setLive(lastActivity(response.result.value.events));
    } catch {
    }
  }, [ctx, address]);
  (0, import_react10.useEffect)(() => {
    if (!active) return;
    void load();
    if (!running) return;
    const timer = window.setInterval(() => {
      void load();
    }, POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [load, running, active]);
  (0, import_react10.useEffect)(() => () => {
    controllerRef.current?.abort();
  }, []);
  if (!running) return null;
  if (live.text === void 0 && live.tool === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLive, children: t("subagentThinking") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
    live.tool !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLive, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLiveTool, children: live.tool.name }),
      live.tool.args !== "" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLiveArgs, children: preview(live.tool.args, ARGS_PREVIEW) })
    ] }),
    live.text !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLiveText, children: flatten(live.text) })
  ] });
}
function CatalogRows({
  parentSessionId,
  catalog,
  catalogs,
  byId,
  level,
  currentSessionId,
  active,
  ctx,
  openChild,
  refresh
}) {
  const emptyLoading = catalog?.state === "loading" && catalog.entries.length === 0;
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
    emptyLoading && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CatalogLoadingRows, { parentSessionId, byId, level }),
    catalog?.state === "error" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentError, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: catalog.error?.message ?? t("error") }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentErrorRetry,
          onClick: () => {
            refresh(parentSessionId);
          },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.IconRefreshOutline14, {}),
            t("retry")
          ]
        }
      )
    ] }),
    (catalog?.entries ?? []).map((entry) => {
      if (entry.kind === "diagnostic") {
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentNode, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
          "div",
          {
            role: "treeitem",
            "aria-disabled": "true",
            "aria-level": level,
            className: `${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRow} ${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRowDisabled}`,
            title: diagnosticReason(entry),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.StateDot, { state: "error", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentDot }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentContent, children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLabel, children: entry.id }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentSecondary, children: diagnosticReason(entry) })
              ] })
            ]
          }
        ) }, entry.id);
      }
      const childCatalog = catalogs[entry.id];
      const knownLeaf = !entry.hasChildren;
      const summary = byId[entry.id];
      const label = childLabel(entry, summary);
      const secondary = cardSecondary(summary, entry);
      const childLoading = childCatalog === void 0 || childCatalog.state === "loading" && childCatalog.entries.length === 0;
      const address = {
        parentSessionId,
        childSessionId: entry.id,
        mode: entry.mode
      };
      const current = entry.id === currentSessionId;
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentNode, children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
          "div",
          {
            role: "treeitem",
            tabIndex: 0,
            "aria-level": level,
            "aria-label": `${label} ${secondary}`,
            "aria-current": current ? "true" : void 0,
            ...knownLeaf ? {} : { "aria-expanded": true },
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRow, current && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRowActive),
            onClick: () => {
              openChild(address);
            },
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                openChild(address);
              }
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                import_dsh_client_ui_primitives7.StateDot,
                {
                  state: entry.activity === "running" ? "ongoing" : "done",
                  className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentDot
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentContent, children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLabel, children: label }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentSecondary, children: secondary }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                  SubagentLiveLines,
                  {
                    ctx,
                    parentSessionId,
                    childSessionId: entry.id,
                    mode: entry.mode,
                    running: entry.activity === "running",
                    active
                  }
                )
              ] })
            ]
          }
        ),
        !knownLeaf && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { role: "group", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentChildren, "aria-busy": childLoading || void 0, children: childCatalog === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          CatalogLoadingRows,
          {
            parentSessionId: entry.id,
            byId,
            level: level + 1
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
          CatalogRows,
          {
            parentSessionId: entry.id,
            catalog: childCatalog,
            catalogs,
            byId,
            level: level + 1,
            currentSessionId,
            active,
            ctx,
            openChild,
            refresh
          }
        ) })
      ] }, entry.id);
    })
  ] });
}
function JobOutputPane(props) {
  const { ownerSessionId, job, active, onClose } = props;
  const [state, setState] = (0, import_react10.useState)("loading");
  const controllerRef = (0, import_react10.useRef)(void 0);
  const preRef = (0, import_react10.useRef)(null);
  const load = (0, import_react10.useCallback)(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const result = await api.jobOutput({ sessionId: ownerSessionId }, job.id, controller.signal);
      setState(result);
    } catch {
      setState((current) => current === "loading" ? "error" : current);
    }
  }, [ownerSessionId, job.id]);
  (0, import_react10.useEffect)(() => {
    void load();
    if (!active || !isJobLive(job)) return;
    const timer = window.setInterval(() => {
      void load();
    }, JOB_POLL_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [load, active, job.status]);
  (0, import_react10.useEffect)(() => () => {
    controllerRef.current?.abort();
  }, []);
  (0, import_react10.useEffect)(() => {
    if (!isJobLive(job) || typeof state !== "object" || state.text.length === 0) return;
    const pre = preRef.current;
    if (pre !== null) pre.scrollTop = pre.scrollHeight;
  }, [state, job.status]);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPane, role: "region", "aria-label": `${job.label} ${t("jobs")}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.StateDot, { state: jobDotState(job.status), className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneDot }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneLabel, title: job.label, children: job.label }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneStatus, children: [
        jobStatusLabel(job.status, t),
        job.detail !== void 0 && job.detail !== "" ? ` \xB7 ${job.detail}` : ""
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneClose,
          "aria-label": t("close"),
          title: t("close"),
          onClick: onClose,
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(IconStopOutline16, { size: 10 })
        }
      )
    ] }),
    state === "loading" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHint, children: t("loading") }),
    state === "error" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: `${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHint} ${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneError}`, children: t("jobOutputError") }),
    typeof state === "object" && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
      state.text.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("pre", { ref: preRef, className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPanePre, children: state.text }) : state.read ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHint, children: t("jobNoOutput") }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHint, children: t("jobNotReadYet") }),
      state.truncated && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsPaneHint, children: t("jobOutputTruncated") })
    ] })
  ] });
}
function JobsSection(props) {
  const { byId, jobsBySession, rootId, active } = props;
  const rows = (0, import_react10.useMemo)(
    () => orderJobs(collectTreeJobs(byId, jobsBySession, rootId)),
    [byId, jobsBySession, rootId]
  );
  const [selectedId, setSelectedId] = (0, import_react10.useState)(void 0);
  const [armedId, setArmedId] = (0, import_react10.useState)(void 0);
  const [killingId, setKillingId] = (0, import_react10.useState)(void 0);
  const [killErrorId, setKillErrorId] = (0, import_react10.useState)(void 0);
  const [now, setNow] = (0, import_react10.useState)(() => Date.now());
  const selectedRow = (0, import_react10.useMemo)(
    () => selectedId === void 0 ? void 0 : rows.find((row) => row.job.id === selectedId),
    [rows, selectedId]
  );
  const liveCount = (0, import_react10.useMemo)(
    () => rows.reduce((count, row) => count + (isJobLive(row.job) ? 1 : 0), 0),
    [rows]
  );
  const multiOwner = (0, import_react10.useMemo)(
    () => new Set(rows.map((row) => row.ownerSessionId)).size > 1,
    [rows]
  );
  (0, import_react10.useEffect)(() => {
    if (armedId === void 0) return;
    const timer = window.setTimeout(() => {
      setArmedId(void 0);
    }, JOB_KILL_ARM_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [armedId]);
  (0, import_react10.useEffect)(() => {
    if (liveCount === 0) return;
    setNow(Date.now());
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1e3);
    return () => {
      window.clearInterval(timer);
    };
  }, [liveCount]);
  (0, import_react10.useEffect)(() => {
    if (selectedId !== void 0 && selectedRow === void 0) setSelectedId(void 0);
  }, [selectedId, selectedRow]);
  const kill = (0, import_react10.useCallback)(async (row) => {
    setKillingId(row.job.id);
    setKillErrorId(void 0);
    try {
      await api.jobKill({ sessionId: row.ownerSessionId }, row.job.id);
    } catch {
      setKillErrorId(row.job.id);
    } finally {
      setKillingId(void 0);
      setArmedId(void 0);
    }
  }, []);
  if (rows.length === 0) return null;
  const countLabel = liveCount > 0 ? t("jobsCountRunning", { count: rows.length, running: liveCount }) : t("jobsCount", { count: rows.length });
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(import_jsx_runtime11.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobs, "aria-label": t("jobs"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsHeader, children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsTitle, children: t("jobs") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsCount, children: countLabel })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("ul", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsList, "aria-label": t("jobs"), children: rows.map((row) => {
        const { job } = row;
        const live = isJobLive(job);
        const selected = selectedId === job.id;
        const armed = armedId === job.id;
        const killing = killingId === job.id;
        const killFailed = killErrorId === job.id;
        const elapsed = live ? now - job.startedAt : (job.finishedAt ?? job.startedAt) - job.startedAt;
        const secondary = [
          ...multiOwner ? [row.ownerTitle] : [],
          jobStatusLabel(job.status, t),
          ...job.detail !== void 0 && job.detail !== "" ? [job.detail] : [],
          formatJobDuration(elapsed, t)
        ].filter(Boolean).join(" \xB7 ");
        return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
          "li",
          {
            className: clsx_default(
              dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsRow,
              !live && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsRowSettled,
              selected && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsRowSelected
            ),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
                "button",
                {
                  type: "button",
                  className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsRowMain,
                  "aria-pressed": selected,
                  "aria-label": `${job.label} ${secondary}`,
                  onClick: () => {
                    setSelectedId(selected ? void 0 : job.id);
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.StateDot, { state: jobDotState(job.status), className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsDot }),
                    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsContent, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsLabelLine, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsKind, children: job.kind }),
                        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsLabel, title: job.label, children: job.label })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsSecondary, children: secondary })
                    ] })
                  ]
                }
              ),
              job.status === "running" && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                "button",
                {
                  type: "button",
                  className: armed ? `${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsKill} ${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsKillArmed}` : dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsKill,
                  "aria-label": armed ? t("jobKillConfirm") : t("jobKill"),
                  title: armed ? t("jobKillConfirm") : t("jobKill"),
                  disabled: killing,
                  onClick: (event) => {
                    event.stopPropagation();
                    if (armed) void kill(row);
                    else setArmedId(job.id);
                  },
                  children: armed ? t("jobKillConfirm") : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(IconStopOutline16, { size: 12 })
                }
              ),
              killFailed && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.jobsKillError, children: t("jobKillError") })
            ]
          },
          job.id
        );
      }) })
    ] }),
    selectedRow !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      JobOutputPane,
      {
        ownerSessionId: selectedRow.ownerSessionId,
        job: selectedRow.job,
        active,
        onClose: () => {
          setSelectedId(void 0);
        }
      }
    )
  ] });
}
function SubagentView(props) {
  const { sessionId, active, ctx, onOpenChild } = props;
  const sessions = ctx.sessions;
  const list = (0, import_react11.useSyncExternalStore)(
    (0, import_react10.useMemo)(() => (callback) => sessions.list.subscribe(callback), [sessions]),
    (0, import_react10.useCallback)(() => sessions.list.getSnapshot(), [sessions])
  );
  const byId = list.byId;
  const catalogs = list.subagentsByParent ?? {};
  const rootId = (0, import_react10.useMemo)(() => rootAncestor(byId, sessionId), [byId, sessionId]);
  const rootCatalog = rootId === void 0 ? void 0 : catalogs[rootId];
  const rootSummary = rootId === void 0 ? void 0 : byId[rootId];
  const observedRef = (0, import_react10.useRef)(/* @__PURE__ */ new Set());
  const observe = (0, import_react10.useCallback)((parentSessionId, open) => {
    sessions.setSubagentCatalogOpen?.(parentSessionId, open);
    if (open) observedRef.current.add(parentSessionId);
    else observedRef.current.delete(parentSessionId);
  }, [sessions]);
  (0, import_react10.useEffect)(() => {
    if (rootId === void 0 || !active) return;
    observe(rootId, true);
    return () => {
      for (const parentSessionId of observedRef.current) {
        sessions.setSubagentCatalogOpen?.(parentSessionId, false);
      }
      observedRef.current.clear();
    };
  }, [rootId, active, observe, sessions]);
  const branches = (0, import_react10.useMemo)(() => collectBranchIds(catalogs, rootId), [catalogs, rootId]);
  (0, import_react10.useEffect)(() => {
    if (!active) return;
    for (const id of branches) {
      if (!observedRef.current.has(id)) observe(id, true);
    }
  }, [branches, active, observe]);
  (0, import_react10.useEffect)(() => () => {
    for (const parentSessionId of observedRef.current) {
      sessions.setSubagentCatalogOpen?.(parentSessionId, false);
    }
    observedRef.current.clear();
  }, [sessions]);
  const openChild = (0, import_react10.useCallback)((address) => {
    onOpenChild?.(address);
    try {
      sessions.openSubagent?.(address);
    } catch (error) {
      console.warn("[dsh-better-sidebar] openSubagent failed:", error);
    }
  }, [sessions, onOpenChild]);
  const openMain = (0, import_react10.useCallback)(() => {
    if (rootId === void 0) return;
    try {
      sessions.open?.(rootId);
    } catch (error) {
      console.warn("[dsh-better-sidebar] open session failed:", error);
    }
  }, [sessions, rootId]);
  const refresh = (0, import_react10.useCallback)((parentSessionId) => {
    void sessions.refreshSubagents?.(parentSessionId);
  }, [sessions]);
  const totals = (0, import_react10.useMemo)(
    () => rootId === void 0 ? { count: 0, runningCount: 0 } : countSubagentDescendants(byId, rootId),
    [byId, rootId]
  );
  const summaryBackedLoading = rootId !== void 0 && (rootCatalog === void 0 || rootCatalog.state === "ready" && rootCatalog.entries.length === 0) && directChildren(byId, rootId).length > 0;
  const readyEmpty = rootCatalog?.state === "ready" && rootCatalog.entries.length === 0 && directChildren(byId, rootId ?? "").length === 0;
  const countLabel = totals.count === 0 ? void 0 : totals.runningCount > 0 ? t("subagentCountRunning", { count: totals.count, running: totals.runningCount }) : t("subagentCount", { count: totals.count });
  const bodyRef = (0, import_react10.useRef)(null);
  const focusAt = (0, import_react10.useCallback)((index) => {
    const items = bodyRef.current?.querySelectorAll(
      '[role="treeitem"]:not([aria-disabled="true"])'
    ) ?? [];
    if (items.length === 0) return;
    items[(index + items.length) % items.length]?.focus();
  }, []);
  const onTreeKeyDown = (0, import_react10.useCallback)((event) => {
    const items = bodyRef.current?.querySelectorAll(
      '[role="treeitem"]:not([aria-disabled="true"])'
    ) ?? [];
    const index = Array.prototype.indexOf.call(items, document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(index < 0 ? items.length - 1 : index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(items.length - 1);
    }
  }, [focusAt]);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagent, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentHeader, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentTitle, children: [
        t("subagent"),
        rootSummary?.displayTitle !== void 0 && rootSummary.displayTitle !== "" ? ` \xB7 ${rootSummary.displayTitle}` : ""
      ] }),
      countLabel !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentCount, children: countLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRefresh,
          "aria-label": t("refresh"),
          title: t("refresh"),
          disabled: rootId === void 0,
          onClick: () => {
            if (rootId !== void 0) refresh(rootId);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_dsh_client_ui_primitives7.IconRefreshOutline14, {})
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
      "div",
      {
        ref: bodyRef,
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentBody,
        onKeyDown: onTreeKeyDown,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
            "div",
            {
              role: "tree",
              "aria-label": t("subagent"),
              "aria-busy": summaryBackedLoading || void 0,
              children: [
                rootId !== void 0 && rootSummary !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
                  "div",
                  {
                    role: "treeitem",
                    tabIndex: 0,
                    "aria-level": 0,
                    "aria-label": `${rootSummary.displayTitle !== "" ? rootSummary.displayTitle : t("subagentMainAgent")} ${t("subagentMainAgent")}`,
                    "aria-current": rootId === sessionId ? "true" : void 0,
                    className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRow, rootId === sessionId && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentRowActive),
                    onClick: openMain,
                    onKeyDown: (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        openMain();
                      }
                    },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                        import_dsh_client_ui_primitives7.StateDot,
                        {
                          state: rootSummary.running === true ? "ongoing" : "done",
                          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentDot
                        }
                      ),
                      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentContent, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentLabel, children: rootSummary.displayTitle !== "" ? rootSummary.displayTitle : t("subagentMainAgent") }),
                        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentSecondary, children: `${t("subagentMainAgent")} \xB7 ${rootSummary.running === true ? t("subagentRunning") : t("subagentInactive")}` })
                      ] })
                    ]
                  }
                ),
                rootId !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentChildren, role: "group", "aria-busy": summaryBackedLoading || void 0, children: [
                  summaryBackedLoading && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(CatalogLoadingRows, { parentSessionId: rootId, byId, level: 1 }),
                  !summaryBackedLoading && /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
                    CatalogRows,
                    {
                      parentSessionId: rootId,
                      catalog: rootCatalog,
                      catalogs,
                      byId,
                      level: 1,
                      currentSessionId: sessionId,
                      active,
                      ctx,
                      openChild,
                      refresh
                    }
                  )
                ] }),
                readyEmpty && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentEmpty, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { children: t("subagentEmpty") }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSubagentView_module_css_default.subagentEmptyHint, children: t("subagentEmptyDesc") })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
            JobsSection,
            {
              byId,
              jobsBySession: list.jobsBySession,
              rootId,
              active
            }
          )
        ]
      }
    )
  ] });
}

// src/client/BrowserView.tsx
var import_react12 = require("react");
var import_dsh_client_ui_primitives8 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/browser.ts
function embeddabilityOf(probe) {
  if (probe.reachable !== true) return "unknown";
  const xfo = probe.xFrameOptions?.trim().toUpperCase();
  if (xfo === "DENY" || xfo === "SAMEORIGIN") return "blocked";
  if (probe.frameAncestors !== void 0 && !probe.frameAncestors.some((source) => source === "*")) return "blocked";
  return "embeddable";
}
function isLoopbackHostname(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host === "::1" || host === "0.0.0.0") return true;
  const parts = host.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
var FORBIDDEN_SCHEMES = /* @__PURE__ */ new Set([
  "javascript",
  "data",
  "file",
  "about",
  "vbscript",
  "blob",
  "mailto",
  "tel",
  "ftp",
  "ftps",
  "ws",
  "wss",
  "sftp",
  "ssh",
  "chrome",
  "chrome-extension",
  "moz-extension",
  "edge",
  "opera",
  "resource",
  "view-source"
]);
function normalizeBrowserUrl(input, selfOrigin) {
  const trimmed = input.trim();
  if (trimmed === "") return { kind: "invalid" };
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
  let withScheme;
  if (schemeMatch === null) {
    withScheme = `https://${trimmed}`;
  } else {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme === "http" || scheme === "https") withScheme = trimmed;
    else if (FORBIDDEN_SCHEMES.has(scheme)) return { kind: "blocked", reason: "scheme" };
    else withScheme = `https://${trimmed}`;
  }
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { kind: "invalid" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { kind: "blocked", reason: "scheme" };
  try {
    if (url.origin === new URL(selfOrigin).origin) return { kind: "ok", url: url.href };
  } catch {
  }
  if (isLoopbackHostname(url.hostname)) return { kind: "blocked", reason: "loopback" };
  return { kind: "ok", url: url.href };
}

// src/client/SandboxStatusBar.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function SandboxStatusBar(props) {
  const { sandboxed, local, dangerCopy, onUnlock, onRestore } = props;
  if (sandboxed) {
    const copy = t("sandboxStatusOn");
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatus, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatusOn), children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxDot }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatusText, title: copy, children: copy }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxAction,
          onClick: onUnlock,
          children: t("sandboxUnlock")
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatus, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatusOff), children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxDot }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxStatusText, title: dangerCopy, children: dangerCopy }),
    local && /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      "button",
      {
        type: "button",
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.sandboxAction,
        onClick: onRestore,
        children: t("sandboxRestore")
      }
    )
  ] });
}

// src/client/BrowserView.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
function desktopInvoke(command, args) {
  const invoke = globalThis.__TAURI_INTERNALS__?.invoke;
  return invoke?.(command, args);
}
var BROWSER_IFRAME_SANDBOX = "allow-scripts allow-forms allow-popups allow-downloads allow-modals allow-popups-to-escape-sandbox";
var ZOOM_MIN = 0.5;
var ZOOM_MAX = 3;
var ZOOM_STEP = 0.1;
var ZOOM_STORE_KEY = "dsh-browser-zoom-by-host";
var BOOKMARKS_STORE_KEY = "dsh-browser-bookmarks";
function bookmarksRead() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_STORE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b) => typeof b === "object" && b !== null && typeof b.url === "string" && typeof b.title === "string"
    );
  } catch {
    return [];
  }
}
function bookmarksWrite(list) {
  try {
    localStorage.setItem(BOOKMARKS_STORE_KEY, JSON.stringify(list));
  } catch {
  }
}
var ZOOM_PRELOAD_FILENAME = ".dsh-browser-zoom-preload.js";
var ZOOM_PRELOAD_JS = `const { ipcRenderer } = require('electron');
window.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    ipcRenderer.sendToHost('zoom-wheel', e.deltaY);
  }
}, { passive: false, capture: true });
`;
function zoomStoreRead() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ZOOM_STORE_KEY) ?? "{}");
    return parsed !== null && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function zoomStoreWrite(map) {
  try {
    localStorage.setItem(ZOOM_STORE_KEY, JSON.stringify(map));
  } catch {
  }
}
function hostOf(raw) {
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}
function webviewSupported() {
  return typeof customElements !== "undefined" && customElements.get("webview") !== void 0;
}
var WEBVIEW_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
function BrowserView(props) {
  const { store, tab } = props;
  const [url, setUrl] = (0, import_react12.useState)(tab.path);
  const [input, setInput] = (0, import_react12.useState)(tab.path ?? "");
  const [message, setMessage] = (0, import_react12.useState)(null);
  const [history, setHistory] = (0, import_react12.useState)(tab.path !== void 0 ? [tab.path] : []);
  const [cursor, setCursor] = (0, import_react12.useState)(tab.path !== void 0 ? 0 : -1);
  const [reloadKey, setReloadKey] = (0, import_react12.useState)(0);
  const [localUnlock, setLocalUnlock] = (0, import_react12.useState)(false);
  const noSandbox = store.getPrefs().browserNoSandbox === true || localUnlock;
  const [embedBlocked, setEmbedBlocked] = (0, import_react12.useState)(null);
  const [forceEmbed, setForceEmbed] = (0, import_react12.useState)(false);
  const [zoom, setZoom] = (0, import_react12.useState)(1);
  const [bookmarksOpen, setBookmarksOpen] = (0, import_react12.useState)(false);
  const [bookmarksVersion, setBookmarksVersion] = (0, import_react12.useState)(0);
  const currentUrl = url ?? "";
  const currentHost = hostOf(currentUrl) ?? "";
  const isCurrentBookmarked = currentUrl !== "" && bookmarksRead().some((b) => b.url === currentUrl);
  const toggleBookmark = () => {
    if (currentUrl === "") return;
    const list = bookmarksRead();
    const idx = list.findIndex((b) => b.url === currentUrl);
    if (idx >= 0) list.splice(idx, 1);
    else {
      let title = currentHost || currentUrl;
      try {
        title = new URL(currentUrl).hostname || title;
      } catch {
      }
      const liveTitle = webviewRef.current?.getTitle?.();
      list.unshift({ url: currentUrl, title: typeof liveTitle === "string" && liveTitle !== "" ? liveTitle : title, addedAt: Date.now() });
    }
    bookmarksWrite(list);
    setBookmarksVersion((v) => v + 1);
  };
  const openInNewTab = (nextUrl) => {
    let host = "";
    try {
      host = new URL(nextUrl).hostname;
    } catch {
    }
    store.reduce((state) => openTabInActivePane(state, {
      id: `browser:${nextUrl}`,
      type: "browser",
      title: host || nextUrl,
      path: nextUrl
    }));
  };
  const zoomRef = (0, import_react12.useRef)(1);
  const persistZoomForHost = (factor) => {
    const live = webviewRef.current?.getURL?.() ?? url;
    const host = hostOf(live ?? "");
    if (host === null) return;
    const map = zoomStoreRead();
    map[host] = factor;
    zoomStoreWrite(map);
  };
  const applyZoom = (next) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    zoomRef.current = clamped;
    setZoom(clamped);
    persistZoomForHost(clamped);
    void webviewRef.current?.setZoomFactor?.(clamped).catch(() => {
    });
  };
  const zoomWheel = (delta) => {
    applyZoom(zoomRef.current + (delta > 0 ? -ZOOM_STEP : ZOOM_STEP));
  };
  const applyZoomForHost = (targetUrl) => {
    const host = hostOf(targetUrl);
    if (host === null) return;
    const saved = zoomStoreRead()[host];
    if (typeof saved !== "number" || !Number.isFinite(saved)) return;
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, saved));
    setZoom(clamped);
    void webviewRef.current?.setZoomFactor?.(clamped).catch(() => {
    });
  };
  const [bridgeConnected, setBridgeConnected] = (0, import_react12.useState)(false);
  const desktopAvailable = () => {
    const globals = globalThis;
    return globals.__DSH_DESKTOP__ === true || globals.__TAURI_INTERNALS__ !== void 0;
  };
  const [isDesktop, setIsDesktop] = (0, import_react12.useState)(desktopAvailable);
  const containerRef = (0, import_react12.useRef)(null);
  const webviewRef = (0, import_react12.useRef)(null);
  const [webviewReady, setWebviewReady] = (0, import_react12.useState)(webviewSupported());
  const [webviewTimedOut, setWebviewTimedOut] = (0, import_react12.useState)(false);
  (0, import_react12.useEffect)(() => {
    if (webviewReady) return;
    let tries = 0;
    let timer;
    const check = () => {
      if (webviewSupported()) {
        setWebviewReady(true);
        return;
      }
      if (tries++ < 50) timer = window.setTimeout(check, 100);
      else {
        setWebviewTimedOut(true);
        if (isDesktop) console.warn("[DSH] <webview> element never became available \u2014 the desktop runtime may not have webviewTag enabled.");
      }
    };
    check();
    return () => {
      if (timer !== void 0) window.clearTimeout(timer);
    };
  }, [webviewReady, isDesktop]);
  (0, import_react12.useEffect)(() => {
    const ready = () => setIsDesktop(true);
    window.addEventListener("dsh-desktop-ready", ready);
    if (desktopAvailable()) setIsDesktop(true);
    return () => window.removeEventListener("dsh-desktop-ready", ready);
  }, []);
  (0, import_react12.useEffect)(() => {
    let cancelled = false;
    const refresh = () => {
      void api.browserBridgeStatus().then(({ connected }) => {
        if (!cancelled) setBridgeConnected(connected);
      }).catch(() => {
        if (!cancelled) setBridgeConnected(false);
      });
    };
    refresh();
    const timer = window.setInterval(refresh, 5e3);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);
  (0, import_react12.useEffect)(() => {
    if (!webviewReady || containerRef.current === null) return;
    if (containerRef.current.querySelector("webview") !== null) return;
    const wv = document.createElement("webview");
    wv.setAttribute("partition", "persist:dsh-browser");
    wv.setAttribute("useragent", WEBVIEW_UA);
    wv.style.position = "absolute";
    wv.style.top = "0";
    wv.style.left = "0";
    wv.style.right = "0";
    wv.style.bottom = "0";
    wv.style.border = "0";
    wv.style.margin = "0";
    const onNavigate = () => {
      const current = wv.getURL();
      if (current) {
        setUrl(current);
        setInput(current);
        persist(current);
        applyZoomForHost(current);
      }
      reportWebContentsId();
    };
    const onZoomChanged = (arg) => {
      let factor;
      if (typeof arg === "number") factor = arg;
      else if (arg !== null && typeof arg === "object" && "zoomFactor" in arg) {
        const v = arg.zoomFactor;
        if (typeof v === "number") factor = v;
      }
      if (typeof factor !== "number" || !Number.isFinite(factor)) return;
      const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, factor));
      setZoom(clamped);
      persistZoomForHost(clamped);
    };
    const onAttach = () => {
      reportWebContentsId();
    };
    const reportWebContentsId = () => {
      const wcid = wv.getWebContentsId?.();
      if (typeof wcid !== "number" || wcid <= 0) return;
      const sid = store.getSnapshot().sessionId;
      if (sid !== void 0) {
        void api.browserRegisterWebContents(sid, wcid).catch((err) => console.warn("[dsh-better-sidebar] register webContents failed:", err instanceof Error ? err.message : String(err)));
      } else {
        console.warn("[dsh-better-sidebar] webview attached but no active sessionId yet; will re-report on next navigation");
      }
    };
    const onIpc = (event) => {
      if (event.channel === "zoom-wheel") {
        const delta = event.args?.[0];
        if (typeof delta === "number" && Number.isFinite(delta)) zoomWheel(delta);
      }
    };
    wv.addEventListener("did-attach", onAttach);
    wv.addEventListener("did-navigate", onNavigate);
    wv.addEventListener("did-navigate-in-page", onNavigate);
    wv.addEventListener("zoom-changed", onZoomChanged);
    wv.addEventListener("ipc-message", onIpc);
    const onNewWindow = (event) => {
      const detail = event.url;
      if (typeof detail !== "string") return;
      event.preventDefault();
      const sid = store.getSnapshot().sessionId;
      if (sid === void 0) return;
      openInNewTab(detail);
    };
    wv.addEventListener("new-window", onNewWindow);
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const sid = store.getSnapshot().sessionId;
        if (sid !== void 0) {
          const { cwd } = await api.sessionCwd({ sessionId: sid });
          const preloadAbs = `${cwd}/${ZOOM_PRELOAD_FILENAME}`.replace(/\\/g, "/");
          await api.fsWrite({ sessionId: sid }, preloadAbs, ZOOM_PRELOAD_JS);
          wv.setAttribute("preload", `file:///${preloadAbs}`);
        }
      } catch {
      }
      if (cancelled) return;
      if (containerRef.current === null || containerRef.current.querySelector("webview") !== null) return;
      containerRef.current.appendChild(wv);
      if (url !== void 0) {
        wv.setAttribute("src", url);
        wv.src = url;
        applyZoomForHost(url);
      }
      webviewRef.current = wv;
    };
    void bootstrap();
    return () => {
      cancelled = true;
      wv.removeEventListener("did-attach", onAttach);
      wv.removeEventListener("did-navigate", onNavigate);
      wv.removeEventListener("did-navigate-in-page", onNavigate);
      wv.removeEventListener("zoom-changed", onZoomChanged);
      wv.removeEventListener("ipc-message", onIpc);
      wv.removeEventListener("new-window", onNewWindow);
      webviewRef.current = null;
      wv.remove();
    };
  }, [webviewReady]);
  (0, import_react12.useEffect)(() => {
    if (url === void 0) return;
    let cancelled = false;
    setEmbedBlocked(null);
    setForceEmbed(false);
    void api.browserProbe(url).then((probe) => {
      if (!cancelled && embeddabilityOf(probe) === "blocked") setEmbedBlocked(url);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  const persist = (nextUrl) => {
    let host = nextUrl;
    try {
      host = new URL(nextUrl).hostname;
    } catch {
    }
    store.reduce((state) => patchTab(state, tab.id, { path: nextUrl, title: host }));
  };
  const navigateTo = (raw) => {
    const result = normalizeBrowserUrl(raw, window.location.origin);
    if (result.kind === "ok") {
      const next = result.url;
      setUrl(next);
      setInput(next);
      setMessage(null);
      setHistory((previous) => [...previous.slice(0, cursor + 1), next]);
      setCursor((previous) => previous + 1);
      setReloadKey((key) => key + 1);
      persist(next);
      if (webviewReady && webviewRef.current !== null) {
        webviewRef.current.src = next;
      } else if (isDesktop) {
        const desktop = desktopInvoke("open_browser_panel", { url: next });
        void desktop?.then(() => setMessage(t("browserDesktopOpened"))).catch((error) => setMessage(String(error)));
      }
      return;
    }
    setMessage(result.kind === "invalid" ? t("browserInvalid") : result.reason === "scheme" ? t("browserBlockedScheme") : t("browserBlockedLoopback"));
  };
  const goBack = () => {
    if (webviewReady && webviewRef.current !== null) {
      webviewRef.current.goBack();
      return;
    }
    if (cursor <= 0) return;
    const next = history[cursor - 1];
    setCursor(cursor - 1);
    setUrl(next);
    setInput(next);
    setReloadKey((key) => key + 1);
  };
  const goForward = () => {
    if (webviewReady && webviewRef.current !== null) {
      webviewRef.current.goForward();
      return;
    }
    if (cursor >= history.length - 1) return;
    const next = history[cursor + 1];
    setCursor(cursor + 1);
    setUrl(next);
    setInput(next);
    setReloadKey((key) => key + 1);
  };
  const reload = () => {
    if (webviewReady && webviewRef.current !== null) {
      webviewRef.current.reload();
      return;
    }
    setReloadKey((key) => key + 1);
  };
  const openInChrome = (target) => {
    setMessage(null);
    const desktop = desktopInvoke("open_browser_panel", { url: target });
    if (desktop !== void 0) {
      void desktop.then(() => setMessage(t("browserDesktopOpened"))).catch((error) => setMessage(String(error)));
      return;
    }
    void api.browserBridgeNavigate(target).then(() => {
      setBridgeConnected(true);
      setMessage(t("browserBridgeConnected"));
    }).catch(() => {
      setBridgeConnected(false);
      setMessage(t("browserBridgeUnavailable"));
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browser, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBar, children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("browserBack"),
          title: t("browserBack"),
          disabled: webviewReady ? false : cursor <= 0,
          onClick: goBack,
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconChevronLeftOutline14, {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("browserForward"),
          title: t("browserForward"),
          disabled: webviewReady ? false : cursor >= history.length - 1,
          onClick: goForward,
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconChevronRightOutline14, {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          onClick: reload,
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconRefreshOutline14, {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "input",
        {
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserInput,
          value: input,
          placeholder: t("browserPlaceholder"),
          spellCheck: false,
          onChange: (event) => {
            setInput(event.target.value);
          },
          onKeyDown: (event) => {
            if (event.key === "Enter") navigateTo(input);
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("browserGo"),
          title: t("browserGo"),
          onClick: () => {
            navigateTo(input);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconLinkOutline14, {})
        }
      ),
      webviewReady && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserZoom, children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
            "aria-label": "\u7F29\u5C0F",
            title: `\u7F29\u5C0F\uFF08\u6700\u4F4E ${Math.round(ZOOM_MIN * 100)}%\uFF09`,
            onClick: () => {
              applyZoom(zoom - ZOOM_STEP);
            },
            children: "\u2212"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserZoomValue,
            title: "\u70B9\u51FB\u91CD\u7F6E\u4E3A 100%",
            onClick: () => {
              applyZoom(1);
            },
            children: [
              Math.round(zoom * 100),
              "%"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
            "aria-label": "\u653E\u5927",
            title: `\u653E\u5927\uFF08\u6700\u9AD8 ${Math.round(ZOOM_MAX * 100)}%\uFF09`,
            onClick: () => {
              applyZoom(zoom + ZOOM_STEP);
            },
            children: "+"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": isDesktop || bridgeConnected ? t("browserBridgeOpen") : t("browserBridgeUnavailable"),
          title: isDesktop || bridgeConnected ? t("browserBridgeOpen") : t("browserBridgeUnavailable"),
          disabled: url === void 0 || !isDesktop && !bridgeConnected,
          onClick: () => {
            if (url !== void 0) openInChrome(url);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconGlobeOutline14, { size: 15 })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": isCurrentBookmarked ? "\u79FB\u9664\u4E66\u7B7E" : "\u6DFB\u52A0\u4E66\u7B7E",
          title: isCurrentBookmarked ? "\u79FB\u9664\u4E66\u7B7E" : "\u6DFB\u52A0\u4E66\u7B7E",
          disabled: currentUrl === "",
          onClick: toggleBookmark,
          children: isCurrentBookmarked ? "\u2605" : "\u2606"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": "\u4E66\u7B7E\u5217\u8868",
          title: "\u4E66\u7B7E\u5217\u8868",
          onClick: () => {
            setBookmarksOpen((open) => !open);
          },
          children: "\u{1F4DA}"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
          "aria-label": t("browserOpenExternal"),
          title: t("browserOpenExternal"),
          disabled: url === void 0,
          onClick: () => {
            if (url !== void 0) window.open(url, "_blank", "noopener");
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(import_dsh_client_ui_primitives8.IconRightUpOutline16, { size: 15 })
        }
      )
    ] }),
    message !== null && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserMessage, children: message }),
    !webviewReady && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      SandboxStatusBar,
      {
        sandboxed: !noSandbox,
        local: localUnlock,
        dangerCopy: t("browserNoSandboxWarning"),
        onUnlock: () => {
          setLocalUnlock(true);
        },
        onRestore: () => {
          setLocalUnlock(false);
        }
      }
    ),
    webviewReady ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserWebview, ref: containerRef, children: bookmarksOpen && /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksOverlay, role: "dialog", "aria-label": "\u4E66\u7B7E", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksHeader, children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "\u4E66\u7B7E" }),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
            "aria-label": "\u5173\u95ED",
            onClick: () => {
              setBookmarksOpen(false);
            },
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("ul", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksList, children: bookmarksRead().length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("li", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksEmpty, children: "\u6682\u65E0\u4E66\u7B7E\uFF0C\u70B9 \u2606 \u6536\u85CF\u5F53\u524D\u9875" }) : bookmarksRead().map((b) => /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("li", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksItem, children: [
        /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksOpenBtn,
            onClick: () => {
              navigateTo(b.url);
              setBookmarksOpen(false);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksTitle, children: b.title }),
              /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bookmarksUrl, children: b.url })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.iconButton,
            "aria-label": "\u5220\u9664\u4E66\u7B7E",
            title: "\u5220\u9664\u4E66\u7B7E",
            onClick: () => {
              const list = bookmarksRead().filter((x) => x.url !== b.url);
              bookmarksWrite(list);
              setBookmarksVersion((v) => v + 1);
            },
            children: "\xD7"
          }
        )
      ] }, b.url)) }, bookmarksVersion)
    ] }) }) : url === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserStart, children: t("browserStart") }) : isDesktop && !webviewTimedOut ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserStart, children: "\u6B63\u5728\u542F\u52A8\u5185\u5D4C\u6D4F\u89C8\u5668\u2026" }) : isDesktop && webviewTimedOut ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserStart, children: [
      "\u5185\u5D4C\u6D4F\u89C8\u5668\u672A\u542F\u7528\uFF1A\u8BF7\u5728 dsh-better-sidebar \u63D2\u4EF6\u76EE\u5F55\u8FD0\u884C",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("code", { children: "scripts\\patch-desktop\\run-patch.bat" }),
      "\uFF08DSH Desktop \u7248\u9700\u8981\u8BE5\u8865\u4E01\uFF0C \u91CD\u542F\u540E\u751F\u6548\uFF09\u3002Web \u7248\u65E0\u6B64\u529F\u80FD\uFF0C\u53EF\u70B9\u53F3\u4E0A\u89D2\u300C\u6253\u5F00\u5916\u90E8\u6D4F\u89C8\u5668\u300D\u3002"
    ] }) : embedBlocked !== null && !forceEmbed ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      BrowserEmbedBlocked,
      {
        url: embedBlocked,
        bridgeConnected: isDesktop || bridgeConnected,
        onOpenInChrome: () => {
          openInChrome(embedBlocked);
        },
        onOpenInBrowser: () => {
          window.open(embedBlocked, "_blank", "noopener");
        },
        onLoadAnyway: () => {
          setForceEmbed(true);
        }
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      "iframe",
      {
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserFrame,
        src: url,
        sandbox: noSandbox ? void 0 : BROWSER_IFRAME_SANDBOX,
        referrerPolicy: "no-referrer",
        allow: "",
        title: url
      },
      `${reloadKey}:${noSandbox ? "ns" : "sb"}`
    )
  ] });
}
function BrowserEmbedBlocked(props) {
  const { url, bridgeConnected, onOpenInChrome, onOpenInBrowser, onLoadAnyway } = props;
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {
  }
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlocked, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedTitle, children: t("browserEmbedBlocked", { host }) }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedDesc, children: t("browserEmbedBlockedDesc") }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedActions, children: [
      bridgeConnected && /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedButton, onClick: onOpenInChrome, children: t("browserBridgeOpen") }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedButton, onClick: onOpenInBrowser, children: t("browserOpenExternal") }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.browserBlockedButton, onClick: onLoadAnyway, children: t("browserEmbedAnyway") })
    ] })
  ] });
}

// src/client/builtins/tabs.tsx
var import_jsx_runtime14 = require("react/jsx-runtime");
var LazyTerminal = lazyChunkComponent(
  "terminal",
  (mod) => mod.TerminalView
);
var TERMINAL_LIMIT = 3;
function terminalUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}
function uiTerminalCount(state) {
  return allLeaves(state.splits).flatMap((leaf) => leaf.tabs).filter((tab) => tab.type === "terminal" && !isAgentTabId(tab.id)).length;
}
function builtinTabs(ctx, options = {}) {
  return [
    {
      id: "editor",
      // The single files window: an editor tab with no path IS the file
      // explorer (empty hint + docked tree); with a path it previews/edits
      // the file. Visible in the + menu in the explorer's old slot.
      title: () => t("files"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_dsh_client_ui_primitives9.IconFolderOpen16, { size }),
      order: 10,
      hidden: false,
      dedupeKey: (tab) => tab.path,
      // Declarative settings: the file-open behavior picker (in-place switch
      // vs per-path windows) renders as an iconed select row under the
      // editor card's gear in the Side card settings page.
      settings: {
        toggles: [{
          key: "editorExplorer",
          type: "select",
          title: () => t("editorExplorer"),
          desc: () => t("editorExplorerDesc"),
          options: [
            {
              value: true,
              icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_dsh_client_ui_primitives9.IconPanelLeftOutline16, { size }),
              title: () => t("editorExplorerMerged"),
              desc: () => t("editorExplorerMergedDesc")
            },
            {
              value: false,
              icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_dsh_client_ui_primitives9.IconCodeOutline16, { size }),
              title: () => t("editorExplorerSplit"),
              desc: () => t("editorExplorerSplitDesc")
            }
          ]
        }]
      },
      component: ({ ctx: ctx2, store, scope, tab, expanded, onToggleDir, onReferenceFile }) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        EditorHost,
        {
          ctx: ctx2,
          store,
          scope,
          tab,
          expanded: expanded ?? [],
          onToggleDir: onToggleDir ?? (() => {
          }),
          onReferenceFile: onReferenceFile ?? (() => {
          })
        }
      )
    },
    {
      id: "git",
      title: () => t("git"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_dsh_client_ui_primitives9.IconBranchOutline16, { size }),
      order: 20,
      single: true,
      component: ({ ctx: ctx2, store, scope, onOpenDiff }) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        GitView,
        {
          scope,
          onOpenFile: (path) => {
            openSidebarFile(ctx2, store, scope.sessionId, path);
          },
          onOpenDiff: onOpenDiff ?? (() => {
          })
        }
      )
    },
    {
      id: "subagent",
      title: () => t("subagent"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_dsh_client_ui_primitives9.IconThinkOutline16, { size }),
      order: 30,
      single: true,
      // Declarative settings: the auto-open switches render under this row in
      // the Side card settings page (the Jobs page's own related settings).
      settings: {
        toggles: [{
          key: "autoOpenSubagent",
          title: () => t("settingsSubagentTitle"),
          desc: () => t("settingsSubagentDesc")
        }, {
          key: "autoOpenJobs",
          title: () => t("settingsJobsTitle"),
          desc: () => t("settingsJobsDesc")
        }]
      },
      component: ({ ctx: ctx2, scope, visible, onSubagentJump }) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        SubagentView,
        {
          sessionId: scope.sessionId,
          ctx: ctx2,
          active: visible,
          onOpenChild: (address) => {
            onSubagentJump?.(address.childSessionId);
          }
        }
      )
    },
    {
      id: "terminal",
      title: () => t("terminal"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(IconTerminalOutline16, { size }),
      order: 40,
      available: (_ctx, _scope, state) => uiTerminalCount(state) < TERMINAL_LIMIT,
      // Declarative settings: the model-facing terminal tools switch, the
      // bottom-panel first-expansion auto-terminal switch, and the custom
      // font family/size rows render under this card in the Side card
      // settings page (the host gates the toolset on the tools one
      // independently; the font rows apply live to every terminal).
      settings: {
        toggles: [{
          key: "agentTerminalTools",
          title: () => t("settingsToolsTitle"),
          desc: () => t("settingsToolsDesc")
        }, {
          key: "bottomPanelAutoTerminal",
          title: () => t("settingsBottomTerminalTitle"),
          desc: () => t("settingsBottomTerminalDesc")
        }, {
          key: "terminalFontFamily",
          type: "text",
          title: () => t("settingsFontFamilyTitle"),
          desc: () => t("settingsFontFamilyDesc"),
          placeholder: t("settingsFontFamilyPlaceholder")
        }, {
          key: "terminalFontSize",
          type: "number",
          title: () => t("settingsFontSizeTitle"),
          desc: () => t("settingsFontSizeDesc"),
          min: TERMINAL_FONT_SIZE_MIN,
          max: TERMINAL_FONT_SIZE_MAX,
          unit: "px"
        }]
      },
      createTab: (state) => {
        const count = uiTerminalCount(state);
        if (count >= TERMINAL_LIMIT) return null;
        return {
          tab: {
            id: `terminal:${terminalUuid()}`,
            type: "terminal",
            title: options.terminalTitle?.() ?? t("terminal")
          },
          // Keep the legacy counter advancing for compatibility with older
          // persisted states; new ids no longer use it.
          patch: { nextTerminal: state.nextTerminal + 1 }
        };
      },
      component: ({ tab, scope, store }) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(LazyTerminal, { scope, store, tabId: tab.id })
    },
    {
      id: "browser",
      title: () => t("browser"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(IconGlobeOutline16, { size }),
      order: 50,
      // Declarative settings: the sandbox escape hatch, the link-takeover
      // MASTER switch, and the per-protocol takeover switches (http on /
      // https off by default) render under this tab's row in the Side card
      // settings page (the sandbox one is warned on).
      settings: {
        toggles: [{
          key: "browserNoSandbox",
          title: () => t("settingsBrowserSandboxTitle"),
          desc: () => t("settingsBrowserSandboxDesc")
        }, {
          key: "browserInterceptLinks",
          title: () => t("settingsBrowserLinksTitle"),
          desc: () => t("settingsBrowserLinksDesc")
        }, {
          key: "browserInterceptHttp",
          title: () => t("settingsBrowserHttpTitle"),
          desc: () => t("settingsBrowserHttpDesc")
        }, {
          key: "browserInterceptHttps",
          title: () => t("settingsBrowserHttpsTitle"),
          desc: () => t("settingsBrowserHttpsDesc")
        }]
      },
      createTab: (state) => ({
        tab: {
          id: `browser:${state.nextBrowser}`,
          type: "browser",
          title: t("browser")
        },
        patch: { nextBrowser: state.nextBrowser + 1 }
      }),
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(BrowserView, { ...props })
    },
    {
      id: "diff",
      title: () => t("git"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(IconDiffOutline16, { size }),
      order: -1,
      hidden: true,
      dedupeKey: (tab) => tab.id,
      component: ({ scope, tab }) => tab.diff === void 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(DiffTab, { sessionId: scope.sessionId, cwd: scope.cwd, diff: tab.diff })
    }
  ];
}

// src/client/builtins/viewers.tsx
var import_dsh_client_ui_primitives10 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/PdfView.tsx
var import_react13 = require("react");
var import_jsx_runtime15 = require("react/jsx-runtime");
function PdfView(props) {
  const { scope, path, title } = props;
  const [load, setLoad] = (0, import_react13.useState)({ status: "loading" });
  const [interactionBlocked, setInteractionBlocked] = (0, import_react13.useState)(false);
  const frameRef = (0, import_react13.useRef)(null);
  const shieldRef = (0, import_react13.useRef)(null);
  (0, import_react13.useEffect)(() => {
    const controller = new AbortController();
    let objectUrl;
    setLoad({ status: "loading" });
    void (async () => {
      try {
        const response = await fetch(mediaUrl(scope, path), { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        setLoad({ status: "ready", url: objectUrl });
      } catch (error) {
        if (controller.signal.aborted) return;
        setLoad({ status: "error", message: error instanceof Error ? error.message : String(error) });
      }
    })();
    return () => {
      controller.abort();
      if (objectUrl !== void 0) URL.revokeObjectURL(objectUrl);
    };
  }, [scope.sessionId, scope.cwd, path]);
  (0, import_react13.useEffect)(() => {
    const block = () => {
      setInteractionBlocked(true);
      if (frameRef.current !== null) frameRef.current.style.pointerEvents = "none";
      if (shieldRef.current !== null) shieldRef.current.style.pointerEvents = "auto";
    };
    const unblock = () => {
      setInteractionBlocked(false);
      if (frameRef.current !== null) frameRef.current.style.pointerEvents = "";
      if (shieldRef.current !== null) shieldRef.current.style.pointerEvents = "none";
    };
    const blockForResize = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(`.${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelResize}, .${dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.divider}`) !== null) {
        block();
      }
    };
    document.addEventListener("dragstart", block, true);
    document.addEventListener("dragend", unblock, true);
    document.addEventListener("drop", unblock, true);
    window.addEventListener("pointerdown", blockForResize, true);
    window.addEventListener("pointerup", unblock, true);
    window.addEventListener("pointercancel", unblock, true);
    window.addEventListener("blur", unblock);
    return () => {
      document.removeEventListener("dragstart", block, true);
      document.removeEventListener("dragend", unblock, true);
      document.removeEventListener("drop", unblock, true);
      window.removeEventListener("pointerdown", blockForResize, true);
      window.removeEventListener("pointerup", unblock, true);
      window.removeEventListener("pointercancel", unblock, true);
      window.removeEventListener("blur", unblock);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdf, children: [
    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfToolbar, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("a", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorDownloadLink, href: downloadUrl(scope, path), download: true, children: t("downloadToView") }) }),
    /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfStage, children: [
      load.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPlaceholder, children: t("loading") }),
      load.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorError, children: load.message }),
      load.status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "iframe",
        {
          ref: frameRef,
          className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfFrame, interactionBlocked && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfFrameBlocked),
          src: load.url,
          title
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
        "div",
        {
          ref: shieldRef,
          className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfDragShield, interactionBlocked && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPdfDragShieldActive),
          "aria-hidden": "true"
        }
      )
    ] })
  ] });
}

// src/client/builtins/viewers.tsx
var import_jsx_runtime16 = require("react/jsx-runtime");
var LazyTextEditor = lazyChunkComponent("editor", (mod) => mod.TextEditor);
function builtinViewers() {
  return [
    {
      id: "image",
      title: () => t("viewerImage"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(IconImageOutline16, { size }),
      exts: ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "avif"],
      fetchStrategy: "mediaUrl",
      component: ({ mediaUrl: url, title }) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorImageWrap, children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("img", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorImage, src: url, alt: title }) })
    },
    {
      id: "pdf",
      title: () => t("viewerPdf"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(IconPdfOutline16, { size }),
      exts: ["pdf"],
      fetchStrategy: "mediaUrl",
      component: ({ scope, path, title }) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(PdfView, { scope, path, title })
    },
    {
      id: "markdown",
      title: () => t("viewerMarkdown"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(IconMarkdownOutline16, { size }),
      exts: ["md", "markdown"],
      fetchStrategy: "fsRead",
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(LazyTextEditor, { ...props })
    },
    {
      id: "html",
      title: () => t("viewerHtml"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(IconHtmlOutline16, { size }),
      exts: ["html", "htm"],
      fetchStrategy: "fsRead",
      // Declarative settings: the sandbox escape hatch and the default-unsafe
      // start state render under this viewer's row in the Side card settings
      // page (both warned on).
      settings: {
        toggles: [{
          key: "htmlViewerNoSandbox",
          title: () => t("settingsHtmlSandboxTitle"),
          desc: () => t("settingsHtmlSandboxDesc")
        }, {
          key: "htmlViewerDefaultUnsafe",
          title: () => t("settingsHtmlDefaultUnsafeTitle"),
          desc: () => t("settingsHtmlDefaultUnsafeDesc")
        }]
      },
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(LazyTextEditor, { ...props })
    },
    {
      id: "code",
      title: () => t("viewerCode"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_dsh_client_ui_primitives10.IconCodeOutline16, { size }),
      exts: [],
      priority: -100,
      fetchStrategy: "fsRead",
      component: (props) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(LazyTextEditor, { ...props })
    },
    {
      id: "binary-download",
      title: () => t("viewerBinary"),
      icon: (size) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_dsh_client_ui_primitives10.IconDownloadOutline16, { size }),
      exts: ["doc", "xls", "ppt"],
      priority: -50,
      fetchStrategy: "binary-download",
      // NUL probe: a file whose head bytes contain a NUL is binary — claimed
      // before the catch-all code viewer on the head re-match.
      detect: (_path, head) => head.includes(0),
      component: ({ scope, path }) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(BinaryDownload, { scope, path })
    }
  ];
}

// src/client/builtins/index.ts
function registerBuiltins(ctx, service, options = {}) {
  const disposers = [];
  for (const tab of builtinTabs(ctx, options)) {
    disposers.push(service.registerTab(tab));
  }
  for (const viewer of builtinViewers()) {
    disposers.push(service.registerFileViewer(viewer));
  }
  return () => {
    for (const d of disposers) {
      try {
        d();
      } catch {
      }
    }
  };
}

// src/client/Sidebar.tsx
var import_react17 = require("react");
var import_react18 = require("react");
var import_dsh_client_ui_primitives12 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/conversation-draft.ts
function appendToDraft(ctx, sessionId, text) {
  try {
    const actx = ctx.sessions.scope(sessionId);
    if (actx === void 0) return false;
    const conversation = ctx.get("conversation");
    if (conversation === void 0) return false;
    const input = conversation.input.for(actx);
    const draft = input.state.getSnapshot().draft;
    input.setDraft(draft.trim() === "" ? text : `${draft} ${text}`);
    return true;
  } catch (error) {
    console.warn("[dsh-better-sidebar] draft insert failed:", error);
    return false;
  }
}

// src/client/split-pane.tsx
var import_react15 = require("react");

// src/client/TabBar.tsx
var import_react14 = require("react");
var import_dsh_client_ui_primitives11 = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime17 = require("react/jsx-runtime");
var TAB_DRAG_TYPE = "application/x-dsh-tab";
function serializeDrag(payload) {
  return JSON.stringify(payload);
}
function parseDrag(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.tabId === "string" && typeof parsed.paneId === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}
function setTabDragging(active) {
  if (active) document.body.setAttribute("data-dsh-tab-dragging", "");
  else document.body.removeAttribute("data-dsh-tab-dragging");
}
function TabBar(props) {
  const {
    paneId,
    tabs,
    active,
    onActivate,
    onClose,
    onNewTab,
    newTabOptions,
    onDropTab,
    getTabIcon,
    getTabBadge
  } = props;
  const [menuOpen, setMenuOpen] = (0, import_react14.useState)(false);
  const [dragOver, setDragOver] = (0, import_react14.useState)(false);
  const listRef = (0, import_react14.useRef)(null);
  (0, import_react14.useEffect)(() => {
    const el = listRef.current;
    if (el === null) return;
    const onWheel = (event) => {
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
      if (el.scrollWidth <= el.clientWidth) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1;
      el.scrollLeft += (event.deltaX + event.deltaY) * unit;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);
  (0, import_react14.useEffect)(() => {
    const clear = () => {
      setTabDragging(false);
      setDragOver(false);
    };
    window.addEventListener("dragend", clear, true);
    window.addEventListener("drop", clear, true);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("dragend", clear, true);
      window.removeEventListener("drop", clear, true);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
    "div",
    {
      className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabBar, dragOver && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabBarDrop),
      onDragOver: (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(true);
      },
      onDragLeave: () => {
        setDragOver(false);
      },
      onDrop: (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
        setTabDragging(false);
        const raw = event.dataTransfer.getData(TAB_DRAG_TYPE);
        const payload = parseDrag(raw);
        if (payload !== null) onDropTab(payload, null);
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { ref: listRef, className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabList, children: [
        tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
          "div",
          {
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tab, active === tab.id && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabActive),
            title: tab.title,
            draggable: true,
            onDragStart: (event) => {
              setTabDragging(true);
              event.dataTransfer.setData(TAB_DRAG_TYPE, serializeDrag({ tabId: tab.id, paneId }));
              event.dataTransfer.effectAllowed = "move";
            },
            onDragEnd: () => {
              setTabDragging(false);
              setDragOver(false);
            },
            onDragOver: (event) => {
              event.preventDefault();
              event.stopPropagation();
            },
            onDrop: (event) => {
              event.preventDefault();
              event.stopPropagation();
              setTabDragging(false);
              const raw = event.dataTransfer.getData(TAB_DRAG_TYPE);
              const payload = parseDrag(raw);
              if (payload !== null) onDropTab(payload, tab.id);
            },
            onClick: () => {
              onActivate(tab.id);
            },
            onAuxClick: (event) => {
              if (event.button === 1) {
                event.preventDefault();
                onClose(tab.id);
              }
            },
            children: [
              getTabIcon?.(tab) ?? null,
              getTabBadge?.(tab) ?? null,
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabTitle, children: tab.title }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                "button",
                {
                  type: "button",
                  className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabClose,
                  "aria-label": t("close"),
                  onClick: (event) => {
                    event.stopPropagation();
                    onClose(tab.id);
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_dsh_client_ui_primitives11.IconCloseFill14, {})
                }
              )
            ]
          },
          tab.id
        )),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          import_dsh_client_ui_primitives11.Menu,
          {
            open: menuOpen,
            onClose: () => {
              setMenuOpen(false);
            },
            items: newTabOptions.map((option) => ({
              id: option.id,
              label: option.label,
              ...option.disabled === true ? { disabled: true } : {},
              ...option.icon !== void 0 ? { icon: option.icon } : {}
            })),
            onSelect: (id) => {
              onNewTab(id);
              setMenuOpen(false);
            },
            portal: true,
            align: "end",
            anchor: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "button",
              {
                type: "button",
                className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabBarPlus,
                "aria-label": t("newTab"),
                title: t("newTab"),
                onClick: () => {
                  setMenuOpen((v) => !v);
                },
                children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_dsh_client_ui_primitives11.IconPlusOutline16, {})
              }
            )
          }
        )
      ] })
    }
  );
}

// src/client/split-pane.tsx
var import_jsx_runtime18 = require("react/jsx-runtime");
function Divider(props) {
  const { dir, onResize } = props;
  const last = (0, import_react15.useRef)({ x: 0, y: 0, size: 0 });
  const [dragging, setDragging] = (0, import_react15.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    "div",
    {
      className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.divider, dir === "row" ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.dividerRow : dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.dividerCol, dragging && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.dividerActive),
      onPointerDown: (event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const box = event.currentTarget.parentElement?.getBoundingClientRect();
        last.current = {
          x: event.clientX,
          y: event.clientY,
          size: box === void 0 ? 1 : dir === "row" ? box.width : box.height
        };
        setDragging(true);
      },
      onPointerMove: (event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const delta = dir === "row" ? event.clientX - last.current.x : event.clientY - last.current.y;
        onResize(delta / Math.max(1, last.current.size));
        last.current.x = event.clientX;
        last.current.y = event.clientY;
      },
      onPointerUp: (event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
      }
    }
  );
}
function zoneAt(event, pane) {
  const rect = pane.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return "center";
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  if (x < 0.25) return "left";
  if (x > 0.75) return "right";
  if (y < 0.25) return "up";
  if (y > 0.75) return "down";
  return "center";
}
function PaneEmptyCards(props) {
  const { newTabOptions, onNewTab } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneEmptyCards, children: newTabOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "button",
    {
      type: "button",
      className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneCard,
      disabled: option.disabled === true,
      title: option.label,
      onClick: () => {
        onNewTab(option.id);
      },
      children: [
        option.icon ?? null,
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: option.label })
      ]
    },
    option.id
  )) });
}
function LeafView(props) {
  const { leaf, newTabOptions, actions, onNewTab, renderTab, getTabIcon, getTabBadge } = props;
  const [dropZone, setDropZone] = (0, import_react15.useState)(null);
  const activeTab = leaf.tabs.find((tab) => tab.id === leaf.active) ?? leaf.tabs[leaf.tabs.length - 1];
  (0, import_react15.useEffect)(() => {
    const clear = () => {
      setDropZone(null);
    };
    window.addEventListener("dragend", clear, true);
    window.addEventListener("drop", clear, true);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("dragend", clear, true);
      window.removeEventListener("drop", clear, true);
      window.removeEventListener("blur", clear);
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
    "div",
    {
      className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.pane, dropZone !== null && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneDrop),
      onPointerDown: () => {
        actions.focusPane(leaf.id);
      },
      onDragOver: (event) => {
        event.preventDefault();
        const zone = zoneAt(event, event.currentTarget);
        setDropZone(zone);
      },
      onDragLeave: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setDropZone(null);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        const zone = dropZone ?? zoneAt(event, event.currentTarget);
        setDropZone(null);
        const payload = parseDrag(event.dataTransfer.getData("application/x-dsh-tab"));
        if (payload !== null) actions.moveTabToEdge(payload, leaf.id, zone);
      },
      children: [
        dropZone !== null && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.dropOverlay, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default[`drop${dropZone[0].toUpperCase()}${dropZone.slice(1)}`]) }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          TabBar,
          {
            paneId: leaf.id,
            tabs: leaf.tabs,
            active: leaf.active,
            onActivate: (tabId) => {
              actions.activateTab(leaf.id, tabId);
            },
            onClose: (tabId) => {
              actions.closeTab(leaf.id, tabId);
            },
            onNewTab,
            newTabOptions,
            getTabIcon,
            getTabBadge,
            onDropTab: (payload, before) => {
              if (before === null) actions.moveTabToEdge(payload, leaf.id, "center");
              else actions.moveTabBefore(payload, leaf.id, before);
            }
          }
        ),
        leaf.tabs.length > 0 ? (
          /*
            Every tab stays MOUNTED (inactive ones hidden), so switching tabs
            never tears down the content: a terminal keeps its pty connection
            and scrollback, an editor keeps its CodeMirror view and unsaved
            draft, explorer/git keep their loaded data. The unmount (and the
            terminal's close frame) happens only when a tab is truly closed.
          */
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneContent, children: leaf.tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            "div",
            {
              className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneTab, tab.id !== activeTab?.id && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.paneTabHidden),
              children: renderTab(tab, tab.id === activeTab?.id, leaf.id)
            },
            tab.id
          )) })
        ) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(PaneEmptyCards, { newTabOptions, onNewTab })
      ]
    }
  );
}
function NodeView(props) {
  const { node, state, newTabOptions, actions, onNewTab, renderTab, getTabIcon, getTabBadge } = props;
  if (node.kind === "leaf") {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      LeafView,
      {
        leaf: node,
        newTabOptions,
        actions,
        onNewTab,
        renderTab,
        getTabIcon,
        getTabBadge
      }
    );
  }
  const isRow = node.dir === "row";
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.split, isRow ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.splitRow : dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.splitCol), children: node.children.map((child, index) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_react15.Fragment, { children: [
    index > 0 && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      Divider,
      {
        dir: node.dir,
        onResize: (deltaFrac) => {
          actions.resizeSplit(node.id, index - 1, deltaFrac);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      "div",
      {
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.splitChild,
        style: { flexGrow: node.sizes[index], flexBasis: 0, minWidth: 0, minHeight: 0 },
        children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          NodeView,
          {
            node: child,
            state,
            newTabOptions,
            actions,
            onNewTab,
            renderTab,
            getTabIcon,
            getTabBadge
          }
        )
      }
    )
  ] }, child.id)) });
}
function Workbench(props) {
  const { state, tree, newTabOptions, actions, onNewTab, renderTab, getTabIcon, getTabBadge } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.workbench, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
    NodeView,
    {
      node: tree ?? state.splits,
      state,
      newTabOptions,
      actions,
      onNewTab,
      renderTab,
      getTabIcon,
      getTabBadge
    }
  ) });
}

// src/client/OrphanedTab.tsx
var import_jsx_runtime19 = require("react/jsx-runtime");
function OrphanedTab(props) {
  const { tab } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editor, children: [
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorHeader, children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorTitle, title: tab.type, children: tab.title }) }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.editorPlaceholder, children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { children: t("pluginNotLoaded") }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("code", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.orphanedType, children: tab.type })
    ] })
  ] });
}

// src/client/RenderBoundary.tsx
var import_react16 = require("react");
var import_jsx_runtime20 = require("react/jsx-runtime");
var RenderBoundary = class extends import_react16.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  componentDidCatch(error, info) {
    console.error("[dsh-better-sidebar] render error:", error, info.componentStack);
  }
  render() {
    if (this.state.error !== null) {
      return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("div", { className: this.props.className, children: [
        /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)("span", { children: [
          "dsh-better-sidebar: ",
          this.state.error
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.terminalRetry,
            onClick: () => {
              this.setState({ error: null });
            },
            children: t("terminalRetry")
          }
        )
      ] });
    }
    return this.props.children;
  }
};

// src/client/Sidebar.tsx
var import_jsx_runtime21 = require("react/jsx-runtime");
var FAILURE_LIMIT = 3;
function TabContent(props) {
  const { tab, sessionId, cwd, expanded, onToggleDir, onReferenceFile, ctx, store, visible, onSubagentJump, onOpenDiff } = props;
  const scope = { sessionId, cwd };
  const descriptor = ctx.betterSidebar?.getTab(tab.type);
  if (descriptor === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(OrphanedTab, { ctx, store, scope, tab, visible });
  }
  return (0, import_react17.createElement)(
    RenderBoundary,
    { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabBoundaryError },
    (0, import_react17.createElement)(descriptor.component, {
      ctx,
      store,
      scope,
      tab,
      visible,
      expanded,
      onToggleDir,
      onReferenceFile,
      onOpenDiff,
      onSubagentJump
    })
  );
}
function buildNewTabOptions(state, ctx, scope) {
  const service = ctx.betterSidebar;
  if (service === void 0) return [];
  return service.getTabs().filter((d) => !d.hidden && service.isTabEnabled(d.id)).sort((a, b) => (a.order ?? 100) - (b.order ?? 100)).map((d) => ({
    id: d.id,
    label: typeof d.title === "function" ? d.title() : d.title,
    disabled: !(d.available?.(ctx, scope, state) ?? true),
    icon: typeof d.icon === "function" ? d.icon(16) : d.icon
  }));
}
function Sidebar(props) {
  const { ctx, store } = props;
  const localeRevision = (0, import_react18.useSyncExternalStore)(
    (0, import_react17.useMemo)(() => (callback) => ctx.locale.subscribe(callback), [ctx]),
    (0, import_react17.useCallback)(() => ctx.locale.getSnapshot().active, [ctx])
  );
  void localeRevision;
  const narrow = useNarrowViewport();
  const sessionList = (0, import_react18.useSyncExternalStore)(
    (0, import_react17.useMemo)(() => (callback) => ctx.sessions.list.subscribe(callback), [ctx]),
    (0, import_react17.useCallback)(() => ctx.sessions.list.getSnapshot(), [ctx])
  );
  const current = sessionList.current;
  const snapshot = (0, import_react18.useSyncExternalStore)(
    (0, import_react17.useCallback)((callback) => store.subscribe(callback), [store]),
    (0, import_react17.useCallback)(() => store.getSnapshot(), [store])
  );
  (0, import_react17.useEffect)(() => {
    store.setSession(current);
  }, [current, store]);
  const state = snapshot.state;
  const sessionId = snapshot.sessionId;
  const panelSide = state?.panelSide ?? "right";
  const summaryCwd = sessionId === void 0 ? void 0 : sessionList.byId[sessionId]?.cwd;
  const collapsed = state === void 0 || !state.panelOpen;
  (0, import_react17.useEffect)(() => {
    if (collapsed) document.body.setAttribute("data-dsh-sidebar-collapsed", "");
    else document.body.removeAttribute("data-dsh-sidebar-collapsed");
    document.body.setAttribute("data-dsh-sidebar-side", panelSide);
    return () => {
      document.body.removeAttribute("data-dsh-sidebar-collapsed");
      document.body.removeAttribute("data-dsh-sidebar-side");
    };
  }, [collapsed, panelSide]);
  const titleBarCompat = snapshot.prefs.titleBarCompat;
  const titleBarStrip = snapshot.prefs.titleBarStripPx;
  (0, import_react17.useEffect)(() => {
    const root = document.documentElement;
    if (titleBarCompat) {
      document.body.setAttribute("data-dsh-title-bar-compat", "");
      root.style.setProperty("--dsh-title-bar-strip", `${titleBarStrip}px`);
    } else {
      document.body.removeAttribute("data-dsh-title-bar-compat");
      root.style.removeProperty("--dsh-title-bar-strip");
    }
    return () => {
      document.body.removeAttribute("data-dsh-title-bar-compat");
      root.style.removeProperty("--dsh-title-bar-strip");
    };
  }, [titleBarCompat, titleBarStrip]);
  (0, import_react17.useEffect)(() => {
    if (!narrow || sessionId === void 0) return;
    store.reduce(migrateBottomTabs);
  }, [narrow, sessionId, store]);
  const [fetchedCwd, setFetchedCwd] = (0, import_react17.useState)(void 0);
  (0, import_react17.useEffect)(() => {
    setFetchedCwd(void 0);
    if (sessionId === void 0 || summaryCwd !== void 0) return;
    let cancelled = false;
    api.sessionCwd({ sessionId }).then((result) => {
      if (!cancelled) setFetchedCwd(result.cwd);
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, summaryCwd]);
  const cwd = summaryCwd ?? fetchedCwd;
  (0, import_react17.useEffect)(() => {
    if (sessionId === void 0) return;
    let socket = null;
    let retry;
    let closed = false;
    let failures = 0;
    const connect = () => {
      if (closed) return;
      const url = new URL("/sidebar/ws/agent-terminals", location.origin);
      url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
      url.search = new URLSearchParams({ sessionId }).toString();
      socket = new WebSocket(url.toString());
      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        try {
          const list = JSON.parse(event.data);
          if (!Array.isArray(list)) return;
          store.reduce((s) => ctx.betterSidebar?.isTabEnabled("terminal") === false ? s : reconcileAgentTerminals(s, list));
        } catch {
        }
      };
      socket.onclose = () => {
        if (closed) return;
        failures += 1;
        if (failures >= FAILURE_LIMIT) {
          console.error("[dsh-better-sidebar] agent-terminals connection failed; stopping reconnect loop", sessionId);
          return;
        }
        retry = window.setTimeout(connect, 2e3);
      };
      socket.onerror = () => {
        socket?.close();
      };
    };
    connect();
    return () => {
      closed = true;
      window.clearTimeout(retry);
      socket?.close();
    };
  }, [sessionId, store]);
  const listBaselineRef = (0, import_react17.useRef)(void 0);
  (0, import_react17.useEffect)(() => {
    const prev = listBaselineRef.current;
    listBaselineRef.current = sessionList;
    if (sessionId === void 0 || prev === void 0) return;
    if (!detectNewDirectSubagent(prev, sessionList, sessionId)) return;
    if (!store.getPrefs().autoOpenSubagent) return;
    if (ctx.betterSidebar?.isTabEnabled("subagent") === false) return;
    store.reduce((s) => s.panelOpen ? s : togglePanel(s));
    store.reduce((s) => ({ ...s, activePane: firstLeaf(s.splits).id }));
    ctx.betterSidebar?.openTab({ type: "subagent", title: t("subagent") });
  }, [sessionList, sessionId, store, ctx]);
  const jobBaselineRef = (0, import_react17.useRef)(void 0);
  (0, import_react17.useEffect)(() => {
    const prev = jobBaselineRef.current;
    jobBaselineRef.current = sessionList;
    if (sessionId === void 0 || prev === void 0) return;
    if (!detectNewJob(prev, sessionList, sessionId)) return;
    if (!store.getPrefs().autoOpenJobs) return;
    if (ctx.betterSidebar?.isTabEnabled("subagent") === false) return;
    store.reduce((s) => s.panelOpen ? s : togglePanel(s));
    store.reduce((s) => ({ ...s, activePane: firstLeaf(s.splits).id }));
    ctx.betterSidebar?.openTab({ type: "subagent", title: t("subagent") });
  }, [sessionList, sessionId, store, ctx]);
  const subagentJumpRef = (0, import_react17.useRef)(void 0);
  (0, import_react17.useEffect)(() => {
    const pending = subagentJumpRef.current;
    if (pending === void 0 || sessionId !== pending) return;
    subagentJumpRef.current = void 0;
    store.reduce((s) => s.panelOpen ? s : togglePanel(s));
    store.reduce((s) => ({ ...s, activePane: firstLeaf(s.splits).id }));
    ctx.betterSidebar?.openTab({ type: "subagent", title: t("subagent") });
  }, [sessionId, store, ctx]);
  const [centerRect, setCenterRect] = (0, import_react17.useState)({ left: 0, right: 0, shellLeft: 0 });
  const centerColRef = (0, import_react17.useRef)(null);
  const draggingRef = (0, import_react17.useRef)(false);
  const measureCenter = (0, import_react17.useCallback)(() => {
    if (draggingRef.current) return;
    const col = centerColRef.current;
    if (col === null) return;
    const rect = col.getBoundingClientRect();
    const shellLeft = col.parentElement?.firstElementChild?.getBoundingClientRect().right ?? rect.left;
    setCenterRect((prev) => prev.left === rect.left && prev.right === rect.right && prev.shellLeft === shellLeft ? prev : { left: rect.left, right: rect.right, shellLeft });
  }, []);
  (0, import_react17.useEffect)(() => {
    let disposed = false;
    let observer;
    const locate = () => {
      if (disposed) return;
      const col = document.querySelector('#root [data-slot="conversation"]')?.parentElement;
      if (col === void 0) {
        if (centerColRef.current !== null) {
          centerColRef.current = null;
          observer?.disconnect();
          observer = void 0;
        }
        return;
      }
      if (centerColRef.current !== col) {
        centerColRef.current = col;
        observer?.disconnect();
        observer = new ResizeObserver(measureCenter);
        observer.observe(col);
      }
      measureCenter();
    };
    locate();
    const watcher = new MutationObserver(locate);
    const root = document.getElementById("root");
    if (root !== null) watcher.observe(root, { childList: true });
    return () => {
      disposed = true;
      observer?.disconnect();
      watcher.disconnect();
      centerColRef.current = null;
    };
  }, [measureCenter]);
  const bottomWasOpenRef = (0, import_react17.useRef)(void 0);
  (0, import_react17.useEffect)(() => {
    if (narrow) return;
    if (state === void 0) return;
    const wasOpen = bottomWasOpenRef.current;
    bottomWasOpenRef.current = state.bottomOpen;
    if (wasOpen === void 0 || wasOpen || !state.bottomOpen) return;
    if (state.bottomOpenedOnce) return;
    if (store.getPrefs().bottomPanelAutoTerminal === false) return;
    if (ctx.betterSidebar?.isTabEnabled("terminal") === false) return;
    store.reduce((s) => ({ ...s, activePane: firstLeaf(s.bottomSplits).id, bottomOpenedOnce: true }));
    ctx.betterSidebar?.openTab({ type: "terminal" });
  }, [state, store, ctx, narrow]);
  const panelRef = (0, import_react17.useRef)(null);
  const bottomRef = (0, import_react17.useRef)(null);
  const widthDrag = (0, import_react17.useRef)({ startX: 0, startWidth: 0 });
  const [draggingWidth, setDraggingWidth] = (0, import_react17.useState)(false);
  const bottomDrag = (0, import_react17.useRef)({ startY: 0, startHeight: 0 });
  const [draggingBottom, setDraggingBottom] = (0, import_react17.useState)(false);
  const cornerDrag = (0, import_react17.useRef)({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const [draggingCorner, setDraggingCorner] = (0, import_react17.useState)(false);
  const anyDragging = draggingWidth || draggingBottom || draggingCorner;
  (0, import_react17.useEffect)(() => {
    draggingRef.current = anyDragging;
    if (!anyDragging) measureCenter();
  }, [anyDragging, measureCenter]);
  const clampWidth = (width) => Math.min(Math.max(PANEL_MIN, Math.round(width)), Math.max(PANEL_MIN, window.innerWidth));
  const clampHeight = (height) => Math.min(Math.max(BOTTOM_MIN, Math.round(height)), Math.max(BOTTOM_MIN, window.innerHeight - PANEL_MIN));
  const applyDrag = (width, height) => {
    panelRef.current?.style.setProperty("width", `${width}px`);
    bottomRef.current?.style.setProperty("height", `${height}px`);
    const widthDelta = width - (state?.width ?? 0);
    if (panelSide === "left") {
      bottomRef.current?.style.setProperty("left", `${centerRect.left + widthDelta}px`);
      bottomRef.current?.style.setProperty("right", `${window.innerWidth - centerRect.right}px`);
    } else {
      bottomRef.current?.style.setProperty("left", `${centerRect.left}px`);
      bottomRef.current?.style.setProperty("right", `${window.innerWidth - centerRect.right + widthDelta}px`);
    }
    document.documentElement.style.setProperty("--dsh-sidebar-width", `${width}px`);
    document.documentElement.style.setProperty("--dsh-sidebar-width-left", panelSide === "left" ? `${width}px` : "0px");
    document.documentElement.style.setProperty("--dsh-sidebar-width-right", panelSide === "right" ? `${width}px` : "0px");
    document.documentElement.style.setProperty("--dsh-sidebar-panel-width", `${width}px`);
    document.documentElement.style.setProperty("--dsh-sidebar-height", `${height}px`);
  };
  const dragFrame = (0, import_react17.useRef)(null);
  const pendingDrag = (0, import_react17.useRef)(null);
  const scheduleDrag = (width, height) => {
    pendingDrag.current = { width, height };
    if (dragFrame.current !== null) return;
    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null;
      const pending = pendingDrag.current;
      if (pending !== null) {
        pendingDrag.current = null;
        applyDrag(pending.width, pending.height);
      }
    });
  };
  const stopDragScheduling = () => {
    if (dragFrame.current !== null) {
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = null;
    }
    pendingDrag.current = null;
  };
  (0, import_react17.useEffect)(() => {
    const width = !narrow && snapshot.state?.panelOpen === true ? Math.min(snapshot.state.width, window.innerWidth) : 0;
    const height = !narrow && snapshot.state?.bottomOpen === true ? Math.min(snapshot.state.bottomHeight, window.innerHeight) : 0;
    document.documentElement.style.setProperty("--dsh-sidebar-width", `${width}px`);
    document.documentElement.style.setProperty("--dsh-sidebar-width-left", panelSide === "left" ? `${width}px` : "0px");
    document.documentElement.style.setProperty("--dsh-sidebar-width-right", panelSide === "right" ? `${width}px` : "0px");
    document.documentElement.style.setProperty("--dsh-sidebar-panel-width", `${snapshot.state?.width ?? 0}px`);
    document.documentElement.style.setProperty("--dsh-sidebar-shell-left", `${centerRect.shellLeft}px`);
    document.documentElement.style.setProperty("--dsh-sidebar-height", `${height}px`);
    return () => {
      document.documentElement.style.removeProperty("--dsh-sidebar-width");
      document.documentElement.style.removeProperty("--dsh-sidebar-width-left");
      document.documentElement.style.removeProperty("--dsh-sidebar-width-right");
      document.documentElement.style.removeProperty("--dsh-sidebar-panel-width");
      document.documentElement.style.removeProperty("--dsh-sidebar-shell-left");
      document.documentElement.style.removeProperty("--dsh-sidebar-height");
    };
  }, [narrow, panelSide, centerRect.shellLeft, snapshot.state?.panelOpen, snapshot.state?.width, snapshot.state?.bottomOpen, snapshot.state?.bottomHeight]);
  (0, import_react17.useEffect)(() => {
    if (anyDragging) document.body.setAttribute("data-dsh-sidebar-dragging", "");
    else document.body.removeAttribute("data-dsh-sidebar-dragging");
  }, [anyDragging]);
  const actions = (0, import_react17.useMemo)(() => ({
    closeTab: (paneId, tabId) => {
      const current2 = store.getSnapshot().state;
      const leaf = current2 === void 0 ? void 0 : leafWithTab(current2.splits, tabId) ?? leafWithTab(current2.bottomSplits, tabId);
      const tab = leaf?.tabs.find((candidate) => candidate.id === tabId);
      ctx.betterSidebar?.closeTab(tabId, sessionId === void 0 ? void 0 : { sessionId, cwd });
      if (tab?.type === "terminal") {
        if (isAgentTabId(tabId)) {
          const uuid = agentUuidOf(tabId);
          void api.agentPtyClose(uuid).catch(() => {
          });
        } else if (sessionId !== void 0) {
          void api.ptyClose({ sessionId, cwd }, tabId).catch(() => {
          });
        }
      }
    },
    activateTab: (paneId, tabId) => {
      ctx.betterSidebar?.activateTab(tabId, sessionId === void 0 ? void 0 : { sessionId, cwd });
    },
    focusPane: (paneId) => {
      store.reduce((s) => ({ ...s, activePane: paneId }));
    },
    moveTabToEdge: (payload, toPane, zone) => {
      store.reduce((s) => moveTabToEdge(s, payload.paneId, payload.tabId, toPane, zone));
    },
    moveTabBefore: (payload, toPane, beforeTabId) => {
      store.reduce((s) => {
        let index = -1;
        const source = leafWithTab(s.splits, beforeTabId);
        if (source !== void 0 && source.id === toPane) {
          index = source.tabs.findIndex((tab) => tab.id === beforeTabId);
        }
        return moveTab(s, payload.paneId, payload.tabId, toPane, index);
      });
    },
    resizeSplit: (splitId, index, deltaFrac) => {
      store.reduce((s) => resizeSplitIn(s, splitId, index, deltaFrac));
    }
  }), [store, sessionId, cwd]);
  const referenceInChat = (0, import_react17.useCallback)((path) => {
    if (sessionId === void 0) return;
    appendToDraft(ctx, sessionId, `@${relativeTo(cwd ?? "", path)}`);
  }, [ctx, sessionId, cwd]);
  if (state === void 0 || sessionId === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleCluster, "data-side": panelSide, children: [
      !narrow && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: t("noSession"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleButton, disabled: true, "aria-label": t("noSession"), children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconPanelBottomOutline16, {}) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: t("noSession"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleButton, disabled: true, "aria-label": t("noSession"), children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconPanelRightOutline16, {}) }) })
    ] });
  }
  const onNewTab = (optionId) => {
    const service = ctx.betterSidebar;
    const descriptor = service?.getTab(optionId);
    if (descriptor === void 0) return;
    const title = typeof descriptor.title === "function" ? descriptor.title() : descriptor.title;
    service.openTab({ type: optionId, title }, { sessionId, cwd });
  };
  const tabIconOf = (tab) => {
    const descriptor = ctx.betterSidebar?.getTab(tab.type);
    if (descriptor === void 0) return null;
    return typeof descriptor.icon === "function" ? descriptor.icon(14) : descriptor.icon;
  };
  const tabBadgeOf = (tab) => {
    const descriptor = ctx.betterSidebar?.getTab(tab.type);
    if (descriptor?.badge === void 0) return null;
    let value;
    try {
      value = descriptor.badge(ctx, { sessionId, cwd }, state);
    } catch (error) {
      console.error("[dsh-better-sidebar] tab badge error:", error);
      return null;
    }
    if (value === null || value === void 0 || value === "") return null;
    const text = typeof value === "number" ? value > 99 ? "99+" : String(value) : String(value);
    return /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.tabBadge, children: text });
  };
  const renderTab = (tab, active, paneId, bottom = false) => /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
    TabContent,
    {
      tab,
      sessionId,
      cwd,
      expanded: state.expanded,
      onToggleDir: (path) => {
        store.reduce((s) => toggleExpanded(s, path));
      },
      onReferenceFile: referenceInChat,
      ctx,
      store,
      visible: bottom ? state.bottomOpen && active : state.panelOpen && active,
      onSubagentJump: (childSessionId) => {
        subagentJumpRef.current = childSessionId;
      },
      onOpenDiff: (diffTab) => {
        store.reduce((s) => openDiffTab(s, paneId, diffTab));
      }
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(import_jsx_runtime21.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleCluster, "data-side": panelSide, children: [
      !narrow && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: t("swapPanelSide"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleButton,
          "aria-label": t("swapPanelSide"),
          onClick: () => {
            store.reduce(swapPanelSide);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconPanelSwapOutline16, {})
        }
      ) }),
      !narrow && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: state.bottomOpen ? t("collapseBottomPanel") : t("expandBottomPanel"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleButton,
          "aria-label": state.bottomOpen ? t("collapseBottomPanel") : t("expandBottomPanel"),
          onClick: () => {
            store.reduce(toggleBottomPanel);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconPanelBottomOutline16, {})
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: state.panelOpen ? t("collapse") : t("expand"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
        "button",
        {
          type: "button",
          className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.toggleButton,
          "aria-label": state.panelOpen ? t("collapse") : t("expand"),
          onClick: () => {
            store.reduce(togglePanel);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(IconPanelRightOutline16, {})
        }
      ) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
      "div",
      {
        ref: panelRef,
        className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panel, !state.panelOpen && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelHidden),
        style: {
          width: narrow ? "100vw" : Math.min(state.width, window.innerWidth),
          left: !narrow && panelSide === "left" ? centerRect.shellLeft : void 0,
          right: narrow || panelSide === "right" ? 0 : void 0
        },
        "data-side": panelSide,
        "data-dragging": anyDragging || void 0,
        children: [
          !narrow && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            "div",
            {
              className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelResize, draggingWidth && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelResizeActive),
              onPointerDown: (event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                widthDrag.current = { startX: event.clientX, startWidth: state.width };
                setDraggingWidth(true);
              },
              onPointerMove: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const { startX, startWidth } = widthDrag.current;
                const delta = panelSide === "left" ? event.clientX - startX : startX - event.clientX;
                const width = clampWidth(startWidth + delta);
                const height = state.bottomOpen ? Math.min(state.bottomHeight, window.innerHeight) : 0;
                scheduleDrag(width, height);
              },
              onPointerUp: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                event.currentTarget.releasePointerCapture(event.pointerId);
                const { startX, startWidth } = widthDrag.current;
                const delta = panelSide === "left" ? event.clientX - startX : startX - event.clientX;
                stopDragScheduling();
                store.reduce((s) => setWidth(s, startWidth + delta));
                setDraggingWidth(false);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelBody, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            Workbench,
            {
              state,
              newTabOptions: buildNewTabOptions(state, ctx, { sessionId, cwd }),
              actions,
              onNewTab,
              renderTab,
              getTabIcon: tabIconOf,
              getTabBadge: tabBadgeOf
            }
          ) }),
          !narrow && state.panelOpen && state.bottomOpen && /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            "div",
            {
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.cornerHandle,
              "data-dragging": draggingCorner || void 0,
              onPointerDown: (event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                cornerDrag.current = {
                  startX: event.clientX,
                  startY: event.clientY,
                  startWidth: state.width,
                  startHeight: state.bottomHeight
                };
                setDraggingCorner(true);
              },
              onPointerMove: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const { startX, startY, startWidth, startHeight } = cornerDrag.current;
                const delta = panelSide === "left" ? event.clientX - startX : startX - event.clientX;
                const width = clampWidth(startWidth + delta);
                const height = clampHeight(startHeight + (startY - event.clientY));
                scheduleDrag(width, height);
              },
              onPointerUp: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                event.currentTarget.releasePointerCapture(event.pointerId);
                const { startX, startY, startWidth, startHeight } = cornerDrag.current;
                const delta = panelSide === "left" ? event.clientX - startX : startX - event.clientX;
                stopDragScheduling();
                store.reduce((s) => setBottomHeight(setWidth(s, startWidth + delta), startHeight + (startY - event.clientY)));
                setDraggingCorner(false);
              }
            }
          )
        ]
      }
    ),
    !narrow && /* @__PURE__ */ (0, import_jsx_runtime21.jsxs)(
      "div",
      {
        ref: bottomRef,
        className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bottomPanel, !state.bottomOpen && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bottomPanelHidden),
        style: {
          height: Math.min(state.bottomHeight, window.innerHeight),
          left: panelSide === "left" ? centerRect.left + Math.min(state.width, window.innerWidth) : centerRect.left,
          right: panelSide === "left" ? window.innerWidth - centerRect.right : window.innerWidth - centerRect.right,
          // The seam follows whichever edge owns the vertical panel.
          borderLeft: state.panelOpen && panelSide === "left" ? "1px solid var(--dsw-alias-border-l2)" : void 0,
          borderRight: state.panelOpen && panelSide === "right" ? "1px solid var(--dsw-alias-border-l2)" : void 0
        },
        "data-dragging": draggingBottom || draggingCorner || void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            "div",
            {
              className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bottomResize, draggingBottom && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bottomResizeActive),
              onPointerDown: (event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                bottomDrag.current = { startY: event.clientY, startHeight: state.bottomHeight };
                setDraggingBottom(true);
              },
              onPointerMove: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const { startY, startHeight } = bottomDrag.current;
                const height = clampHeight(startHeight + (startY - event.clientY));
                scheduleDrag(Math.min(state.width, window.innerWidth), height);
              },
              onPointerUp: (event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                event.currentTarget.releasePointerCapture(event.pointerId);
                const { startY, startHeight } = bottomDrag.current;
                stopDragScheduling();
                store.reduce((s) => setBottomHeight(s, startHeight + (startY - event.clientY)));
                setDraggingBottom(false);
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.Tooltip, { label: t("collapseBottomPanel"), side: "bottom", delayMs: 500, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.bottomClose,
              "aria-label": t("collapseBottomPanel"),
              onClick: () => {
                store.reduce(toggleBottomPanel);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(import_dsh_client_ui_primitives12.IconCloseFill14, {})
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime21.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.panelBody, children: /* @__PURE__ */ (0, import_jsx_runtime21.jsx)(
            Workbench,
            {
              state,
              tree: state.bottomSplits,
              newTabOptions: buildNewTabOptions(state, ctx, { sessionId, cwd }),
              actions,
              onNewTab,
              renderTab: (tab, active, paneId) => renderTab(tab, active, paneId, true),
              getTabIcon: tabIconOf,
              getTabBadge: tabBadgeOf
            }
          ) })
        ]
      }
    )
  ] });
}

// src/client/link-intercept.ts
function shouldInterceptLink(anchorHref, selfOrigin) {
  let url;
  try {
    url = new URL(anchorHref);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  try {
    if (url.origin === new URL(selfOrigin).origin) return null;
  } catch {
  }
  return url.href;
}
function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
function registerLinkInterception(opts) {
  const onClick = (event) => {
    if (!isPlainLeftClick(event)) return;
    if (event.defaultPrevented) return;
    const target = event.target;
    if (target === null || typeof target.closest !== "function") return;
    const anchor = target.closest("a[href]");
    if (anchor === null) return;
    const url = shouldInterceptLink(anchor.href, opts.selfOrigin);
    if (url === null) return;
    if (!opts.takeoverEnabled(new URL(url))) return;
    event.preventDefault();
    opts.openInSidebar(url);
  };
  document.addEventListener("click", onClick, true);
  return () => {
    document.removeEventListener("click", onClick, true);
  };
}

// src/client/ime-guard.ts
function isImeComposition(event) {
  return event.isComposing || event.keyCode === 229;
}
function registerImeGuard() {
  const onKey = (event) => {
    if (isImeComposition(event)) event.stopPropagation();
  };
  document.addEventListener("keydown", onKey, true);
  document.addEventListener("keyup", onKey, true);
  return () => {
    document.removeEventListener("keydown", onKey, true);
    document.removeEventListener("keyup", onKey, true);
  };
}

// src/client/settings-nav-icon.ts
var SETTINGS_NAV_MARKER = "data-dsh-better-sidebar-settings-nav";
function registerSettingsNavIcon(label) {
  let disposed = false;
  const sync = () => {
    if (disposed) return;
    const currentLabel = label().trim();
    const buttons = document.querySelectorAll('[role="dialog"] nav button');
    for (const button of buttons) {
      const matches = currentLabel.length > 0 && button.textContent?.trim() === currentLabel;
      if (matches) button.setAttribute(SETTINGS_NAV_MARKER, "");
      else button.removeAttribute(SETTINGS_NAV_MARKER);
    }
  };
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => {
    disposed = true;
    observer.disconnect();
    document.querySelectorAll(`[${SETTINGS_NAV_MARKER}]`).forEach((element) => {
      element.removeAttribute(SETTINGS_NAV_MARKER);
    });
  };
}

// src/client/prefs.ts
function parsePrefs(value) {
  if (value === null || typeof value !== "object") return { ...SIDEBAR_PREFS_DEFAULTS };
  const record = value;
  return {
    openByDefault: typeof record.openByDefault === "boolean" ? record.openByDefault : SIDEBAR_PREFS_DEFAULTS.openByDefault,
    defaultWidthPercent: typeof record.defaultWidthPercent === "number" && Number.isFinite(record.defaultWidthPercent) ? clampWidthPercent(record.defaultWidthPercent) : SIDEBAR_PREFS_DEFAULTS.defaultWidthPercent,
    autoOpenSubagent: typeof record.autoOpenSubagent === "boolean" ? record.autoOpenSubagent : SIDEBAR_PREFS_DEFAULTS.autoOpenSubagent,
    autoOpenJobs: typeof record.autoOpenJobs === "boolean" ? record.autoOpenJobs : SIDEBAR_PREFS_DEFAULTS.autoOpenJobs,
    agentTerminalTools: typeof record.agentTerminalTools === "boolean" ? record.agentTerminalTools : SIDEBAR_PREFS_DEFAULTS.agentTerminalTools,
    bottomPanelAutoTerminal: typeof record.bottomPanelAutoTerminal === "boolean" ? record.bottomPanelAutoTerminal : SIDEBAR_PREFS_DEFAULTS.bottomPanelAutoTerminal,
    terminalFontFamily: typeof record.terminalFontFamily === "string" ? record.terminalFontFamily : SIDEBAR_PREFS_DEFAULTS.terminalFontFamily,
    terminalFontSize: typeof record.terminalFontSize === "number" && Number.isFinite(record.terminalFontSize) ? clampTerminalFontSize(record.terminalFontSize) : SIDEBAR_PREFS_DEFAULTS.terminalFontSize,
    interceptOpenPath: typeof record.interceptOpenPath === "boolean" ? record.interceptOpenPath : SIDEBAR_PREFS_DEFAULTS.interceptOpenPath,
    editorExplorer: typeof record.editorExplorer === "boolean" ? record.editorExplorer : SIDEBAR_PREFS_DEFAULTS.editorExplorer,
    titleBarCompat: typeof record.titleBarCompat === "boolean" ? record.titleBarCompat : SIDEBAR_PREFS_DEFAULTS.titleBarCompat,
    titleBarStripPx: typeof record.titleBarStripPx === "number" && Number.isFinite(record.titleBarStripPx) ? clampTitleBarStrip(record.titleBarStripPx) : SIDEBAR_PREFS_DEFAULTS.titleBarStripPx,
    htmlViewerNoSandbox: typeof record.htmlViewerNoSandbox === "boolean" ? record.htmlViewerNoSandbox : SIDEBAR_PREFS_DEFAULTS.htmlViewerNoSandbox,
    htmlViewerDefaultUnsafe: typeof record.htmlViewerDefaultUnsafe === "boolean" ? record.htmlViewerDefaultUnsafe : SIDEBAR_PREFS_DEFAULTS.htmlViewerDefaultUnsafe,
    browserNoSandbox: typeof record.browserNoSandbox === "boolean" ? record.browserNoSandbox : SIDEBAR_PREFS_DEFAULTS.browserNoSandbox,
    browserInterceptLinks: typeof record.browserInterceptLinks === "boolean" ? record.browserInterceptLinks : SIDEBAR_PREFS_DEFAULTS.browserInterceptLinks,
    browserInterceptHttp: typeof record.browserInterceptHttp === "boolean" ? record.browserInterceptHttp : SIDEBAR_PREFS_DEFAULTS.browserInterceptHttp,
    browserInterceptHttps: typeof record.browserInterceptHttps === "boolean" ? record.browserInterceptHttps : SIDEBAR_PREFS_DEFAULTS.browserInterceptHttps,
    tabsEnabled: booleanMapOf(record.tabsEnabled),
    viewersEnabled: booleanMapOf(record.viewersEnabled),
    pluginSettings: pluginSettingsMapOf(record.pluginSettings)
  };
}
function pluginSettingsMapOf(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [id, blob] of Object.entries(value)) {
    if (blob !== null && typeof blob === "object" && !Array.isArray(blob)) {
      out[id] = blob;
    }
  }
  return out;
}
function booleanMapOf(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "boolean") out[key] = item;
  }
  return out;
}
async function loadPrefs(settings) {
  try {
    const view = await settings.settingsGet();
    return parsePrefs(view.value);
  } catch {
    return { ...SIDEBAR_PREFS_DEFAULTS };
  }
}
async function loadExternalDisable(settings) {
  try {
    const view = await settings.settingsGet();
    return view.externalDisable === true;
  } catch {
    return false;
  }
}

// src/client/SideCardSection.tsx
var import_react20 = require("react");
var import_dsh_client_ui_primitives14 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/add-plugin-modal.tsx
var import_react19 = require("react");
var import_dsh_client_ui_primitives13 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/plugins-shared.ts
var PLUGIN_TOPIC_URL = "https://github.com/topics/dsh-better-sidebar";

// src/client/plugins-tabs.ts
var builtinTabPlugins = [
  {
    id: "@dsh-external/dsh-sentinel",
    name: "dsh-sentinel \u5524\u9192\u7CFB\u7EDF",
    url: "https://github.com/fuhefei/dsh-sentinel",
    description: () => t("pluginSentinelDesc"),
    // The official one-line bundle-channel install (git source, build
    // artifacts committed — no build step needed). The `github:…` form is
    // the upstream's documented command, `cd ~/.dsh` keeps the profile
    // context consistent with the other entries.
    install: 'cd ~/.dsh && dsh plugin --profile web add "github:fuhefei/dsh-sentinel#v0.7.0"'
  },
  {
    id: "dsh-git-remotes",
    name: "dsh-git-remotes Git \u8FDC\u7A0B",
    url: "https://github.com/yq04/dsh-git-remotes",
    description: () => t("pluginGitRemotesDesc"),
    install: "cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar && dsh plugin --profile web add git+https://github.com/yq04/dsh-git-remotes.git"
  },
  {
    id: "dsh-sidebar-qa",
    name: "dsh-sidebar-qa \u5212\u9009\u8FFD\u95EE",
    url: "https://github.com/ChenRuoT/dsh-sidebar-qa",
    description: () => t("pluginSidebarQaDesc"),
    // dsh-sidebar-qa hard-depends on dsh-better-sidebar (required peer), so
    // the install line installs the prerequisite first, then the plugin.
    install: "cd ~/.dsh && dsh plugin --profile web add dsh-better-sidebar && dsh plugin --profile web add git+https://github.com/ChenRuoT/dsh-sidebar-qa.git"
  }
];

// src/client/plugins-viewers.ts
var builtinViewerPlugins = [
  {
    id: "@huanlin/dsh-plugin-better-sidebar-plugin-office",
    name: "Office \u9884\u89C8\u63D2\u4EF6",
    url: "https://github.com/HuanLinOTO/dsh-plugin-better-sidebar-plugin-office",
    description: () => t("pluginOfficeDesc"),
    install: "cd ~/.dsh && dsh plugin --profile web add @huanlin/dsh-plugin-better-sidebar-plugin-office"
  },
  {
    id: "dsh-video-preview",
    name: "\u89C6\u9891\u9884\u89C8\u63D2\u4EF6",
    url: "https://github.com/zemul/dsh-video-preview",
    description: () => t("pluginVideoPreviewDesc"),
    install: "cd ~/.dsh && dsh plugin --profile web add dsh-video-preview"
  }
];

// dshinline: dsh-inline:D%3A%5C%E5%B7%A5%E4%BD%9C%5CAI%E6%96%87%E4%BB%B6%5Cdeepseek%20harness%5Cdsh-better-sidebar%5Csrc%5Cclient%5CSideCardSection.module.css.mjs
var css3 = ".ohR00W_section{flex-direction:column;gap:14px;width:100%;max-width:760px;display:flex}.ohR00W_intro{color:var(--dsw-alias-label-tertiary);margin:0;padding:0 2px;font-size:13px;line-height:20px}.ohR00W_group{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:16px;flex-direction:column;flex:none;gap:8px;padding:18px 20px 20px;display:flex}.ohR00W_groupHeading{color:var(--dsw-alias-label-primary);align-items:baseline;gap:7px;padding:0 2px 6px;font-size:13px;font-weight:600;line-height:20px;display:flex}.ohR00W_count{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:12px;font-weight:400;line-height:18px}.ohR00W_grid{grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px;display:grid}.ohR00W_card{border:1px solid var(--dsw-alias-border-l2);font:inherit;color:inherit;cursor:pointer;background:0 0;border-radius:12px;flex-direction:column;transition:background .12s,border-color .12s;display:flex;position:relative}.ohR00W_card:not(.ohR00W_cardOn):hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-label-dimmed)}.ohR00W_cardOn{border-color:var(--dsw-alias-button-primary-fill);background:var(--dsw-alias-interactive-bg-active)}.ohR00W_cardMain{border-radius:inherit;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;flex-direction:column;gap:6px;padding:12px;display:flex}.ohR00W_cardMain:focus-visible,.ohR00W_cardGear:focus-visible,.ohR00W_rowGear:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:2px}.ohR00W_cardTop{align-items:center;gap:8px;min-width:0;display:flex}.ohR00W_cardIconChip{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:28px;height:28px;color:var(--dsw-alias-label-tertiary);border-radius:8px;flex:none;justify-content:center;align-items:center;display:inline-flex}.ohR00W_cardOn .ohR00W_cardIconChip{border-color:color-mix(in srgb, var(--dsw-alias-button-primary-fill) 35%, transparent);background:color-mix(in srgb, var(--dsw-alias-button-primary-fill) 12%, transparent);color:var(--dsw-alias-button-primary-fill)}.ohR00W_cardTitle{min-width:0;color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis;flex:1;font-size:13px;font-weight:600;line-height:20px;overflow:hidden}.ohR00W_cardOn .ohR00W_cardTitle{color:var(--dsw-alias-label-primary)}.ohR00W_cardCheck{background:var(--dsw-alias-button-primary-fill);width:16px;height:16px;color:var(--dsw-alias-bg-layer-3);border-radius:50%;flex:none;justify-content:center;align-items:center;display:inline-flex}.ohR00W_cardDesc{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;font-size:11px;line-height:16px;overflow:hidden}.ohR00W_addCard{border-style:dashed;border-color:var(--dsw-alias-border-l2);text-align:left;align-items:flex-start;padding:12px}.ohR00W_addCard:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-primary)}.ohR00W_addCard:hover .ohR00W_cardTitle{color:var(--dsw-alias-label-primary)}.ohR00W_addCard:hover .ohR00W_cardIconChip{border-color:color-mix(in srgb, var(--dsw-alias-button-primary-fill) 35%, transparent);color:var(--dsw-alias-button-primary-fill)}.ohR00W_addCard:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:2px}.ohR00W_cardOn .ohR00W_cardDesc{color:var(--dsw-alias-label-secondary)}.ohR00W_cardWithGear .ohR00W_cardDesc{padding-right:30px}.ohR00W_cardGear{width:16px;height:16px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:50%;justify-content:center;align-items:center;padding:0;display:inline-flex;position:absolute;top:46px;right:12px}.ohR00W_cardGear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.ohR00W_rowGear{width:22px;height:22px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.ohR00W_rowGear:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.ohR00W_row{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:16px;padding:12px 2px;display:flex}.ohR00W_row:last-child{border-bottom:none}.ohR00W_rowText{flex-direction:column;gap:4px;min-width:0;display:flex}.ohR00W_title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}.ohR00W_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.ohR00W_switch{cursor:pointer;flex:none;display:inline-flex;position:relative}.ohR00W_switchInput{opacity:0;width:1px;height:1px;margin:0;position:absolute}.ohR00W_switchTrack{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;align-items:center;width:36px;height:20px;padding:2px;transition:background .15s,border-color .15s;display:inline-flex}.ohR00W_switchThumb{background:var(--dsw-alias-label-secondary);border-radius:50%;width:14px;height:14px;transition:transform .15s,background .15s;display:block}.ohR00W_switch:hover .ohR00W_switchTrack{border-color:var(--dsw-alias-label-dimmed)}.ohR00W_switchInput:checked+.ohR00W_switchTrack{border-color:var(--dsw-alias-button-primary-fill);background:var(--dsw-alias-button-primary-fill)}.ohR00W_switchInput:checked+.ohR00W_switchTrack .ohR00W_switchThumb{background:var(--dsw-alias-bg-layer-3);transform:translate(16px)}.ohR00W_switchInput:focus-visible+.ohR00W_switchTrack{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.ohR00W_control{flex:none;align-items:center;gap:6px;display:flex}.ohR00W_percentInput{width:76px}.ohR00W_typedInput{width:200px}.ohR00W_typedInputNumber{width:76px}.ohR00W_selectAnchor{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);max-width:220px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;align-items:center;gap:6px;padding:4px 8px;font-size:13px;line-height:20px;display:flex}.ohR00W_selectAnchor:hover{border-color:var(--dsw-alias-label-dimmed)}.ohR00W_selectAnchorIcon{flex:none;display:inline-flex}.ohR00W_selectAnchorText{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.ohR00W_selectOption{align-items:center;gap:10px;min-width:200px;display:flex}.ohR00W_selectOptionIcon{color:var(--dsw-alias-label-secondary);flex:none;display:inline-flex}.ohR00W_selectOptionText{flex-direction:column;min-width:0;display:flex}.ohR00W_suffix{color:var(--dsw-alias-label-secondary);font-size:14px;line-height:22px}.ohR00W_popupDialog.ohR00W_popupDialog{width:min(460px,100%)}.ohR00W_popupRows{flex-direction:column;gap:10px;width:100%;display:flex}.ohR00W_popupRow{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;justify-content:space-between;align-items:center;gap:16px;min-width:0;padding:14px 16px;transition:border-color .16s,background .16s;display:flex}.ohR00W_popupRow:hover{border-color:var(--dsw-alias-label-dimmed)}.ohR00W_done{appearance:none;font:inherit;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}.ohR00W_done:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.ohR00W_error{color:var(--dsw-alias-state-error-primary);padding:10px 0 2px;font-size:12px;line-height:17px}.ohR00W_pluginModal.ohR00W_pluginModal{width:min(560px,100%)}.ohR00W_pluginList{flex-direction:column;gap:12px;width:100%;display:flex}.ohR00W_pluginTopicBtn{appearance:none;border:1px solid var(--dsw-alias-border-l2);width:100%;font:inherit;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);cursor:pointer;border-radius:8px;padding:6px 12px;font-size:12px;line-height:18px}.ohR00W_pluginTopicBtn:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-primary)}.ohR00W_pluginTopicBtn:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:1px}.ohR00W_pluginEmpty{color:var(--dsw-alias-label-tertiary);padding:20px 2px;font-size:12px;line-height:18px}.ohR00W_pluginEntries{flex-direction:column;gap:10px;display:flex}.ohR00W_pluginEntry{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-direction:column;gap:4px;padding:12px;display:flex}.ohR00W_pluginEntryHead{justify-content:space-between;align-items:center;gap:12px;display:flex}.ohR00W_pluginEntryActions{flex:none;align-items:center;gap:6px;display:inline-flex}.ohR00W_pluginJumpBtn{appearance:none;border:1px solid var(--dsw-alias-border-l2);font:inherit;cursor:pointer;color:var(--dsw-alias-label-secondary);background:0 0;border-radius:8px;flex:none;padding:3px 12px;font-size:12px;line-height:1.5}.ohR00W_pluginJumpBtn:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-interactive-bg-hover-accent);color:var(--dsw-alias-label-primary)}.ohR00W_pluginJumpBtn:focus-visible{outline:2px solid var(--dsw-alias-border-l4);outline-offset:1px}.ohR00W_pluginName{appearance:none;min-width:0;font:inherit;color:var(--dsw-alias-label-primary);text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;padding:0;font-size:13px;font-weight:600;line-height:20px;text-decoration:none;overflow:hidden}.ohR00W_pluginName:hover{color:var(--dsw-alias-button-primary-fill);text-decoration:underline}.ohR00W_pluginDesc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.ohR00W_pluginInstall{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);white-space:nowrap;border-radius:8px;padding:6px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:16px;display:block;overflow-x:auto}.ohR00W_pluginCopyBtn{appearance:none;font:inherit;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3);border:1px solid #0000;border-radius:8px;flex:none;padding:3px 12px;font-size:12px;line-height:1.5}.ohR00W_pluginCopyBtn:hover{background:var(--dsw-alias-button-primary-hover)}.ohR00W_pluginCopyBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}@media (prefers-reduced-motion:reduce){.ohR00W_card,.ohR00W_switchTrack,.ohR00W_switchThumb{transition:none}}";
var tagId3 = "dsh-external/dsh-better-sidebar/SideCardSection.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId3) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-external/dsh-better-sidebar";
  tag.dataset.pluginCss = tagId3;
  tag.textContent = css3;
  document.head.appendChild(tag);
}
var dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default = { "done": "ohR00W_done", "pluginEntry": "ohR00W_pluginEntry", "pluginEntryActions": "ohR00W_pluginEntryActions", "selectOptionText": "ohR00W_selectOptionText", "pluginEntryHead": "ohR00W_pluginEntryHead", "title": "ohR00W_title", "cardTop": "ohR00W_cardTop", "percentInput": "ohR00W_percentInput", "pluginInstall": "ohR00W_pluginInstall", "selectOptionIcon": "ohR00W_selectOptionIcon", "popupRows": "ohR00W_popupRows", "group": "ohR00W_group", "pluginJumpBtn": "ohR00W_pluginJumpBtn", "intro": "ohR00W_intro", "pluginCopyBtn": "ohR00W_pluginCopyBtn", "cardMain": "ohR00W_cardMain", "cardIconChip": "ohR00W_cardIconChip", "rowGear": "ohR00W_rowGear", "control": "ohR00W_control", "pluginList": "ohR00W_pluginList", "switch": "ohR00W_switch", "pluginEmpty": "ohR00W_pluginEmpty", "switchThumb": "ohR00W_switchThumb", "count": "ohR00W_count", "typedInput": "ohR00W_typedInput", "popupRow": "ohR00W_popupRow", "pluginEntries": "ohR00W_pluginEntries", "switchInput": "ohR00W_switchInput", "pluginName": "ohR00W_pluginName", "cardWithGear": "ohR00W_cardWithGear", "grid": "ohR00W_grid", "cardCheck": "ohR00W_cardCheck", "desc": "ohR00W_desc", "groupHeading": "ohR00W_groupHeading", "cardTitle": "ohR00W_cardTitle", "row": "ohR00W_row", "section": "ohR00W_section", "switchTrack": "ohR00W_switchTrack", "typedInputNumber": "ohR00W_typedInputNumber", "rowText": "ohR00W_rowText", "selectAnchor": "ohR00W_selectAnchor", "card": "ohR00W_card", "cardGear": "ohR00W_cardGear", "error": "ohR00W_error", "pluginModal": "ohR00W_pluginModal", "cardDesc": "ohR00W_cardDesc", "popupDialog": "ohR00W_popupDialog", "pluginTopicBtn": "ohR00W_pluginTopicBtn", "selectAnchorText": "ohR00W_selectAnchorText", "pluginDesc": "ohR00W_pluginDesc", "selectOption": "ohR00W_selectOption", "selectAnchorIcon": "ohR00W_selectAnchorIcon", "addCard": "ohR00W_addCard", "cardOn": "ohR00W_cardOn", "suffix": "ohR00W_suffix" };

// src/client/add-plugin-modal.tsx
var import_jsx_runtime22 = require("react/jsx-runtime");
function catalogOf(kind) {
  return kind === "tab" ? builtinTabPlugins : builtinViewerPlugins;
}
var COPIED_FEEDBACK_MS = 1500;
function PluginListBody(props) {
  const { service, kind } = props;
  const [copiedId, setCopiedId] = (0, import_react19.useState)(null);
  const copy = async (entry) => {
    const written = await (0, import_dsh_client_ui_primitives13.writeClipboard)(entry.install);
    if (!written) return;
    setCopiedId(entry.id);
    window.setTimeout(() => {
      setCopiedId((current) => current === entry.id ? null : current);
    }, COPIED_FEEDBACK_MS);
  };
  const jump = (entry) => {
    window.open(entry.url, "_blank", "noopener");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginList, children: [
    /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
      "button",
      {
        type: "button",
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginTopicBtn,
        onClick: () => {
          window.open(PLUGIN_TOPIC_URL, "_blank", "noopener");
        },
        children: t("addPluginsBrowseMore")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.groupHeading, children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { children: t("addPluginsRecommended") }),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.count, children: catalogOf(kind).length })
    ] }),
    catalogOf(kind).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginEmpty, children: t("addPluginsEmpty") }) : /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginEntries, children: catalogOf(kind).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginEntry, children: [
      /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginEntryHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
          "button",
          {
            type: "button",
            className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginName,
            "aria-label": `${t("openPlugin")}: ${entry.name}`,
            onClick: () => {
              jump(entry);
            },
            children: entry.name
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime22.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginEntryActions, children: [
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginJumpBtn,
              "aria-label": `${t("openPlugin")}: ${entry.name}`,
              onClick: () => {
                jump(entry);
              },
              children: t("openPlugin")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginCopyBtn,
              "aria-label": `${t("copyInstall")}: ${entry.name}`,
              onClick: () => {
                copy(entry);
              },
              children: copiedId === entry.id ? t("copied") : t("copy")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginDesc, children: typeof entry.description === "function" ? entry.description() : entry.description }),
      /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("code", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginInstall, children: entry.install })
    ] }, entry.id)) })
  ] });
}
function AddPluginModal(props) {
  const { service, onClose, kind } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(
    import_dsh_client_ui_primitives13.Modal,
    {
      open: true,
      onClose,
      title: kind === "tab" ? t("addPluginsTabCard") : t("addPluginsViewerCard"),
      description: kind === "tab" ? t("addPluginsTabDesc") : t("addPluginsViewerDesc"),
      closeLabel: t("close"),
      className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.pluginModal,
      footer: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.done, onClick: onClose, children: t("settingsDone") }),
      children: /* @__PURE__ */ (0, import_jsx_runtime22.jsx)(PluginListBody, { service, kind })
    }
  );
}

// src/client/SideCardSection.tsx
var import_jsx_runtime23 = require("react/jsx-runtime");
function messageOf(error) {
  if (error instanceof Error && "code" in error && error.code === "settings-conflict") {
    return `${t("settingsSaveFailed")} ${t("settingsConflict")}`;
  }
  return `${t("settingsSaveFailed")} ${error instanceof Error ? error.message : String(error)}`;
}
function textOf(value) {
  if (value === void 0) return "";
  return typeof value === "function" ? value() : value;
}
function iconOf(icon, size) {
  if (icon === void 0) return null;
  return typeof icon === "function" ? icon(size) : icon;
}
function tabOrder(a, b) {
  if (a.hidden !== b.hidden) return a.hidden === true ? 1 : -1;
  return (a.order ?? 100) - (b.order ?? 100);
}
function viewerOrder(a, b) {
  return (b.priority ?? 0) - (a.priority ?? 0);
}
function hasSettings(feature) {
  const settings = feature.settings;
  return settings !== void 0 && ((settings.toggles?.length ?? 0) > 0 || (settings.pluginToggles?.length ?? 0) > 0 || settings.render !== void 0);
}
function featureNameOf(feature) {
  return textOf("title" in feature ? feature.title : void 0) || feature.id;
}
function mergePluginSetting(pluginSettings, descriptorId, key, value) {
  return {
    ...pluginSettings,
    [descriptorId]: { ...pluginSettings[descriptorId] ?? {}, [key]: value }
  };
}
function SettingsRender(props) {
  let content;
  try {
    content = props.render(props.renderProps);
  } catch (error) {
    content = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.error, role: "alert", children: [
      t("settingsSaveFailed"),
      " ",
      error instanceof Error ? error.message : String(error)
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_jsx_runtime23.Fragment, { children: content });
}
function Switch(props) {
  const { checked, onChange, label } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("label", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.switch, children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      "input",
      {
        type: "checkbox",
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.switchInput,
        checked,
        "aria-label": label,
        onChange: (event) => {
          onChange(event.currentTarget.checked);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.switchTrack, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.switchThumb }) })
  ] });
}
function FeatureSettingsRows(props) {
  const { toggles, prefs, onToggle, onCommit, onSelectValue, valueSource } = props;
  const read = valueSource ?? ((key) => prefs[key]);
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupRows, children: toggles.map((toggle) => {
    const title = textOf(toggle.title);
    if (toggle.type === "select") {
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
        SelectRow,
        {
          toggle,
          title,
          value: read(toggle.key),
          onSelectValue
        },
        toggle.key
      );
    }
    if ((toggle.type ?? "switch") === "switch") {
      return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupRow, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: title }),
          textOf(toggle.desc) !== "" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: textOf(toggle.desc) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
          Switch,
          {
            label: title,
            checked: read(toggle.key) === true,
            onChange: (next) => {
              onToggle(toggle, next);
            }
          }
        )
      ] }, toggle.key);
    }
    const value = String(read(toggle.key) ?? "");
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      TypedRow,
      {
        toggle,
        title,
        value,
        onCommit
      },
      `${toggle.key}:${value}`
    );
  }) });
}
function TypedRow(props) {
  const { toggle, title, value, onCommit } = props;
  const [draft, setDraft] = (0, import_react20.useState)(value);
  const commit = () => {
    const canonical = onCommit?.(toggle, draft) ?? draft;
    setDraft(canonical);
  };
  const number = toggle.type === "number";
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupRow, children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: title }),
      textOf(toggle.desc) !== "" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: textOf(toggle.desc) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.control, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
        import_dsh_client_ui_primitives14.Input,
        {
          type: number ? "number" : "text",
          className: number ? dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.typedInputNumber : dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.typedInput,
          value: draft,
          min: toggle.min,
          max: toggle.max,
          step: 1,
          placeholder: toggle.placeholder,
          "aria-label": title,
          onChange: (event) => {
            setDraft(event.currentTarget.value);
          },
          onBlur: commit,
          onKeyDown: (event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }
        }
      ),
      toggle.unit !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.suffix, children: toggle.unit })
    ] })
  ] });
}
function SelectRow(props) {
  const { toggle, title, value, onSelectValue } = props;
  const options = toggle.options ?? [];
  const multi = toggle.multi === true;
  const [open, setOpen] = (0, import_react20.useState)(false);
  const hasIcons = options.some((option) => option.icon !== void 0);
  const picked = multi ? Array.isArray(value) ? value : [] : [value];
  const selected = options.filter((option) => picked.includes(option.value));
  const pick = (index) => {
    const option = options[index];
    if (option === void 0) return;
    if (!multi) {
      onSelectValue?.(toggle, option.value);
      setOpen(false);
      return;
    }
    const current = Array.isArray(value) ? [...value] : [];
    const at = current.indexOf(option.value);
    if (at >= 0) current.splice(at, 1);
    else current.push(option.value);
    onSelectValue?.(toggle, options.filter((o) => current.includes(o.value)).map((o) => o.value));
  };
  const anchor = /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
    "button",
    {
      type: "button",
      className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectAnchor,
      "aria-label": title,
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      onClick: () => {
        setOpen((now) => !now);
      },
      children: [
        !multi && hasIcons && selected[0] !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectAnchorIcon, children: iconOf(selected[0].icon, 16) }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectAnchorText, children: selected.length === 0 ? "\u2014" : selected.map((option) => textOf(option.title)).join(", ") }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconChevronDownOutline14, { size: 12 })
      ]
    }
  );
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupRow, children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: title }),
      textOf(toggle.desc) !== "" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: textOf(toggle.desc) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.control, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      import_dsh_client_ui_primitives14.Menu,
      {
        open,
        anchor,
        items: options.map((option, index) => ({
          id: String(index),
          label: hasIcons ? /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectOption, children: [
            /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectOptionIcon, children: iconOf(option.icon, 24) }),
            /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.selectOptionText, children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: textOf(option.title) }),
              textOf(option.desc) !== "" && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: textOf(option.desc) })
            ] })
          ] }) : textOf(option.title)
        })),
        selectedId: !multi && selected[0] !== void 0 ? String(options.indexOf(selected[0])) : void 0,
        selectedIds: multi ? selected.map((option) => String(options.indexOf(option))) : void 0,
        onSelect: (id) => {
          pick(Number(id));
        },
        onClose: () => {
          setOpen(false);
        },
        portal: true
      }
    ) })
  ] });
}
function SettingsBody(props) {
  const { feature, prefs, store, service, onToggle, onCommit, onSelectValue, onPluginToggle, onPluginCommit, onPluginSelectValue, onPluginWrite, onClose } = props;
  const render = feature.settings?.render;
  if (render !== void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      SettingsRender,
      {
        render,
        renderProps: {
          store,
          service,
          prefs,
          pluginSettings: prefs.pluginSettings[feature.id] ?? {},
          updatePluginSetting: onPluginWrite,
          close: onClose
        }
      }
    );
  }
  const toggles = feature.settings?.toggles ?? [];
  const pluginToggles = feature.settings?.pluginToggles ?? [];
  if (toggles.length === 0 && pluginToggles.length === 0) return null;
  const pluginBlob = prefs.pluginSettings[feature.id] ?? {};
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupRows, children: [
    toggles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      FeatureSettingsRows,
      {
        toggles,
        prefs,
        onToggle,
        onCommit,
        onSelectValue
      }
    ),
    pluginToggles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      FeatureSettingsRows,
      {
        toggles: pluginToggles,
        prefs,
        onToggle: onPluginToggle,
        onCommit: onPluginCommit,
        onSelectValue: onPluginSelectValue,
        valueSource: (key) => pluginBlob[key]
      }
    )
  ] });
}
function SideCardSection({ store, service }) {
  const [prefs, setPrefs] = (0, import_react20.useState)(() => store.getPrefs());
  const [widthDraft, setWidthDraft] = (0, import_react20.useState)(String(store.getPrefs().defaultWidthPercent));
  const [error, setError] = (0, import_react20.useState)(null);
  const [settingsFor, setSettingsFor] = (0, import_react20.useState)(null);
  const [stripSettingsOpen, setStripSettingsOpen] = (0, import_react20.useState)(false);
  const [addPluginsOpen, setAddPluginsOpen] = (0, import_react20.useState)(null);
  const optimisticRef = (0, import_react20.useRef)(prefs);
  (0, import_react20.useEffect)(() => {
    optimisticRef.current = prefs;
  }, [prefs]);
  const [tabs, setTabs] = (0, import_react20.useState)(() => [...service.getTabs()].sort(tabOrder));
  const [viewers, setViewers] = (0, import_react20.useState)(() => [...service.getFileViewers()].sort(viewerOrder));
  (0, import_react20.useEffect)(() => service.subscribe(() => {
    setTabs([...service.getTabs()].sort(tabOrder));
    setViewers([...service.getFileViewers()].sort(viewerOrder));
  }), [service]);
  const revisionRef = (0, import_react20.useRef)(void 0);
  const dirtyRef = (0, import_react20.useRef)(false);
  const inFlightRef = (0, import_react20.useRef)(Promise.resolve());
  (0, import_react20.useEffect)(() => {
    let cancelled = false;
    void api.settingsGet().then((view) => {
      if (cancelled) return;
      revisionRef.current = view.revision;
      if (dirtyRef.current) return;
      const next = parsePrefs(view.value);
      setPrefs(next);
      setWidthDraft(String(next.defaultWidthPercent));
    }).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const commit = (patch) => {
    dirtyRef.current = true;
    const run = inFlightRef.current.then(async () => {
      const view = await api.settingsUpdate(
        { ...patch },
        revisionRef.current
      );
      const next = parsePrefs(view.value);
      revisionRef.current = view.revision;
      store.setPrefs(next);
      return next;
    });
    inFlightRef.current = run.then(() => void 0, () => void 0);
    return run.then(
      (next) => ({ ok: true, prefs: next }),
      (caught) => {
        setError(messageOf(caught));
        return { ok: false, prefs };
      }
    );
  };
  const applyOutcome = (previous, outcome) => {
    const settled = outcome.ok ? outcome.prefs : previous;
    setPrefs(settled);
    setWidthDraft(String(settled.defaultWidthPercent));
  };
  const applyPref = (patch) => {
    const previous = optimisticRef.current;
    const next = { ...previous, ...patch };
    optimisticRef.current = next;
    setPrefs(next);
    setError(null);
    void commit(patch).then((outcome) => applyOutcome(previous, outcome));
  };
  const onToggle = (next) => {
    applyPref({ openByDefault: next });
  };
  const onToggleTab = (id, next) => {
    applyPref({ tabsEnabled: { ...optimisticRef.current.tabsEnabled, [id]: next } });
  };
  const onToggleViewer = (id, next) => {
    applyPref({ viewersEnabled: { ...optimisticRef.current.viewersEnabled, [id]: next } });
  };
  const onToggleSetting = (toggle, next) => {
    applyPref({ [toggle.key]: next });
  };
  const onSelectSetting = (toggle, next) => {
    applyPref({ [toggle.key]: next });
  };
  const onCommitSetting = (toggle, raw) => {
    if (toggle.type === "number") {
      const parsed = Number(raw);
      const fallback = String(prefs[toggle.key] ?? "");
      if (!Number.isFinite(parsed)) return fallback;
      let clamped = Math.round(parsed);
      if (toggle.min !== void 0) clamped = Math.max(toggle.min, clamped);
      if (toggle.max !== void 0) clamped = Math.min(toggle.max, clamped);
      applyPref({ [toggle.key]: clamped });
      return String(clamped);
    }
    applyPref({ [toggle.key]: raw });
    return raw;
  };
  const applyPluginSetting = (descriptorId, key, value) => {
    applyPref({ pluginSettings: mergePluginSetting(optimisticRef.current.pluginSettings, descriptorId, key, value) });
  };
  const onPluginToggle = (descriptorId, toggle, next) => {
    applyPluginSetting(descriptorId, toggle.key, next);
  };
  const onPluginCommitSetting = (descriptorId, toggle, raw) => {
    if (toggle.type === "number") {
      const parsed = Number(raw);
      const blob = prefs.pluginSettings[descriptorId] ?? {};
      const fallback = String(blob[toggle.key] ?? "");
      if (!Number.isFinite(parsed)) return fallback;
      let clamped = Math.round(parsed);
      if (toggle.min !== void 0) clamped = Math.max(toggle.min, clamped);
      if (toggle.max !== void 0) clamped = Math.min(toggle.max, clamped);
      applyPluginSetting(descriptorId, toggle.key, clamped);
      return String(clamped);
    }
    applyPluginSetting(descriptorId, toggle.key, raw);
    return raw;
  };
  const commitWidth = () => {
    const parsed = Number(widthDraft);
    if (!Number.isFinite(parsed)) {
      setWidthDraft(String(prefs.defaultWidthPercent));
      return;
    }
    const clamped = clampWidthPercent(parsed);
    const previous = prefs;
    setPrefs({ ...previous, defaultWidthPercent: clamped });
    setWidthDraft(String(clamped));
    setError(null);
    void commit({ defaultWidthPercent: clamped }).then((outcome) => applyOutcome(previous, outcome));
  };
  const renderCard = (props) => {
    const hasSettings2 = props.onOpenSettings !== void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
      "div",
      {
        className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.card, props.enabled && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardOn, hasSettings2 && dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardWithGear),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardMain,
              "aria-pressed": props.enabled,
              title: props.desc,
              onClick: () => {
                props.onToggle(!props.enabled);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTop, children: [
                  props.icon !== null && props.icon !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardIconChip, children: props.icon }),
                  /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTitle, children: props.title }),
                  props.enabled && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardCheck, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconCheckOutline16, { size: 12 }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardDesc, children: props.desc })
              ]
            }
          ),
          hasSettings2 && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardGear,
              "aria-label": `${props.title} ${t("settingsPopup")}`,
              title: t("settingsPopup"),
              onClick: props.onOpenSettings,
              children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconSettingsOutline16, { size: 12 })
            }
          )
        ]
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.section, children: [
    /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("p", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.intro, children: t("settingsIntro") }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.group, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.groupHeading, children: t("settingsGeneralTitle") }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: t("settingsOpenTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: t("settingsOpenDesc") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
          Switch,
          {
            label: t("settingsOpenTitle"),
            checked: prefs.openByDefault,
            onChange: onToggle
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: t("settingsWidthTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: t("settingsWidthDesc") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.control, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            import_dsh_client_ui_primitives14.Input,
            {
              type: "number",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.percentInput,
              value: widthDraft,
              min: WIDTH_PERCENT_MIN,
              max: WIDTH_PERCENT_MAX,
              step: 1,
              "aria-label": t("settingsWidthTitle"),
              onChange: (event) => {
                setWidthDraft(event.currentTarget.value);
              },
              onBlur: commitWidth,
              onKeyDown: (event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.suffix, children: t("settingsWidthSuffix") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: t("settingsOpenPathTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: t("settingsOpenPathDesc") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
          Switch,
          {
            label: t("settingsOpenPathTitle"),
            checked: prefs.interceptOpenPath,
            onChange: (next) => {
              applyPref({ interceptOpenPath: next });
            }
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowText, children: [
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.title, children: t("settingsTitleBarTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.desc, children: t("settingsTitleBarDesc") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.control, children: [
          prefs.titleBarCompat && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            "button",
            {
              type: "button",
              className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.rowGear,
              "aria-label": `${t("settingsTitleBarTitle")} ${t("settingsPopup")}`,
              title: t("settingsPopup"),
              onClick: () => {
                setStripSettingsOpen(true);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconSettingsOutline16, { size: 14 })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
            Switch,
            {
              label: t("settingsTitleBarTitle"),
              checked: prefs.titleBarCompat,
              onChange: (next) => {
                applyPref({ titleBarCompat: next });
              }
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.group, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.groupHeading, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: t("settingsTabsTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.count, children: tabs.length })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.grid, children: [
        tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_react20.Fragment, { children: renderCard({
          title: textOf(tab.title),
          desc: tab.id,
          icon: iconOf(tab.icon, 16),
          enabled: prefs.tabsEnabled[tab.id] !== false,
          onToggle: (next) => {
            onToggleTab(tab.id, next);
          },
          // The settings gear only while the feature is enabled: its
          // related settings are dormant while the feature is off.
          onOpenSettings: prefs.tabsEnabled[tab.id] !== false && hasSettings(tab) ? () => {
            setSettingsFor(tab);
          } : void 0
        }) }, tab.id)),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
          "button",
          {
            type: "button",
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.card, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.addCard),
            onClick: () => {
              setAddPluginsOpen("tab");
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTop, children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardIconChip, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconPlusOutline16, { size: 16 }) }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTitle, children: t("addPluginsTabCard") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardDesc, children: t("addPluginsTabCardDesc") })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.group, children: [
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.groupHeading, children: [
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { children: t("settingsViewersTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.count, children: viewers.length })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.grid, children: [
        viewers.map((viewer) => /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_react20.Fragment, { children: renderCard({
          title: textOf(viewer.title) || viewer.id,
          desc: viewer.exts.length === 0 ? t("settingsViewerCatchAll") : viewer.exts.join(" \xB7 "),
          icon: iconOf(viewer.icon, 16),
          enabled: prefs.viewersEnabled[viewer.id] !== false,
          onToggle: (next) => {
            onToggleViewer(viewer.id, next);
          },
          onOpenSettings: prefs.viewersEnabled[viewer.id] !== false && hasSettings(viewer) ? () => {
            setSettingsFor(viewer);
          } : void 0
        }) }, viewer.id)),
        /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)(
          "button",
          {
            type: "button",
            className: clsx_default(dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.card, dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.addCard),
            onClick: () => {
              setAddPluginsOpen("viewer");
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime23.jsxs)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTop, children: [
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardIconChip, children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(import_dsh_client_ui_primitives14.IconPlusOutline16, { size: 16 }) }),
                /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardTitle, children: t("addPluginsViewerCard") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("span", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.cardDesc, children: t("addPluginsViewerCardDesc") })
            ]
          }
        )
      ] })
    ] }),
    settingsFor !== null && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      import_dsh_client_ui_primitives14.Modal,
      {
        open: true,
        onClose: () => {
          setSettingsFor(null);
        },
        title: featureNameOf(settingsFor),
        description: t("settingsPopupDesc", { feature: featureNameOf(settingsFor) }),
        closeLabel: t("close"),
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupDialog,
        footer: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.done, onClick: () => {
          setSettingsFor(null);
        }, children: t("settingsDone") }),
        children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
          SettingsBody,
          {
            feature: settingsFor,
            prefs,
            onToggle: onToggleSetting,
            onCommit: onCommitSetting,
            onSelectValue: onSelectSetting,
            onPluginToggle: (toggle, next) => {
              onPluginToggle(settingsFor.id, toggle, next);
            },
            onPluginCommit: (toggle, raw) => onPluginCommitSetting(settingsFor.id, toggle, raw),
            onPluginSelectValue: (toggle, next) => {
              applyPluginSetting(settingsFor.id, toggle.key, next);
            },
            onPluginWrite: (key, value) => {
              applyPluginSetting(settingsFor.id, key, value);
            },
            onClose: () => {
              setSettingsFor(null);
            },
            store,
            service
          }
        )
      }
    ),
    stripSettingsOpen && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      import_dsh_client_ui_primitives14.Modal,
      {
        open: true,
        onClose: () => {
          setStripSettingsOpen(false);
        },
        title: t("settingsTitleBarTitle"),
        description: t("settingsPopupDesc", { feature: t("settingsTitleBarTitle") }),
        closeLabel: t("close"),
        className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.popupDialog,
        footer: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("button", { type: "button", className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.done, onClick: () => {
          setStripSettingsOpen(false);
        }, children: t("settingsDone") }),
        children: /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
          FeatureSettingsRows,
          {
            toggles: [{
              key: "titleBarStripPx",
              type: "number",
              title: () => t("settingsTitleBarStripTitle"),
              desc: () => t("settingsTitleBarStripDesc"),
              min: TITLE_BAR_STRIP_MIN,
              max: TITLE_BAR_STRIP_MAX,
              unit: "px"
            }],
            prefs,
            onToggle: onToggleSetting,
            onCommit: onCommitSetting
          }
        )
      }
    ),
    addPluginsOpen !== null && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)(
      AddPluginModal,
      {
        service,
        onClose: () => {
          setAddPluginsOpen(null);
        },
        kind: addPluginsOpen
      }
    ),
    error !== null && /* @__PURE__ */ (0, import_jsx_runtime23.jsx)("div", { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5CSideCardSection_module_css_default.error, role: "alert", children: error })
  ] });
}

// dshinline: dsh-inline:D%3A%5C%E5%B7%A5%E4%BD%9C%5CAI%E6%96%87%E4%BB%B6%5Cdeepseek%20harness%5Cdsh-better-sidebar%5Csrc%5Cclient%5Clayout.css.mjs
var css4 = `#root{margin-right:var(--dsh-sidebar-width-right,0px);transition:margin-right var(--ds-transition-duration-slow) var(--ds-ease-in-out)}body[data-dsh-sidebar-side=left] #root{margin-right:0}body[data-dsh-sidebar-side=left] #root>div[data-slot=root]>div>div:nth-child(2){margin-left:var(--dsh-sidebar-width-left,0px)}body[data-dsh-sidebar-side=right] #root>div[data-slot=root]>div>div:nth-child(2){margin-left:0}#root>div[data-slot=root]>div>div:nth-child(2){margin-bottom:var(--dsh-sidebar-height,0px);transition:margin-bottom var(--ds-transition-duration-slow) var(--ds-ease-in-out)}body[data-dsh-sidebar-side=right][data-dsh-sidebar-collapsed] [data-slot="conversation.session.header"]>header{padding-right:110px}body[data-dsh-sidebar-dragging] #root,body[data-dsh-sidebar-dragging] #root>div[data-slot=root]>div>div:nth-child(2),body[data-dsh-sidebar-side=left][data-dsh-sidebar-dragging] #root>div[data-slot=root]>div>div:nth-child(2){transition:none}[data-dsh-better-sidebar-settings-nav]>svg:first-child{display:none}[data-dsh-better-sidebar-settings-nav]:before{content:"";background:currentColor;flex:none;width:16px;height:16px;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 7v10'/%3E%3Cpath d='M6 5v14'/%3E%3Crect width='12' height='18' x='10' y='3' rx='2'/%3E%3C/svg%3E") 50%/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 7v10'/%3E%3Cpath d='M6 5v14'/%3E%3Crect width='12' height='18' x='10' y='3' rx='2'/%3E%3C/svg%3E") 50%/contain no-repeat}@media (prefers-reduced-motion:reduce){#root,#root>div[data-slot=root]>div>div:nth-child(2){transition:none}}`;
var tagId4 = "dsh-external/dsh-better-sidebar/layout.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId4) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-external/dsh-better-sidebar";
  tag.dataset.pluginCss = tagId4;
  tag.textContent = css4;
  document.head.appendChild(tag);
}

// src/client/index.tsx
var inject = ["slots", "sessions", "connection", "workspaces", "locale"];
function apply(ctx) {
  attachLocale(ctx.locale);
  ctx.effect(() => {
    const offZh = ctx.locale.register(LOCALE_NS, "zh", zh);
    const offEn = ctx.locale.register(LOCALE_NS, "en", en);
    return () => {
      offZh();
      offEn();
    };
  }, "dsh-better-sidebar: dictionaries");
  const sidebarStore = createSidebarStore();
  const service = createBetterSidebarService(sidebarStore);
  ctx.provide("betterSidebar", service);
  const fallbackTitle = t("terminal");
  let terminalTitle = fallbackTitle;
  void api.shellGet().then(({ name }) => {
    terminalTitle = name;
    const snapshot = service.getSnapshot();
    if (snapshot.state === void 0) return;
    const tabs = allLeaves(snapshot.state.splits).concat(allLeaves(snapshot.state.bottomSplits)).flatMap((leaf) => leaf.tabs);
    for (const tab of tabs) {
      if (tab.type === "terminal" && !isAgentTabId(tab.id) && tab.title === fallbackTitle) {
        service.updateTab(tab.id, { title: name });
      }
    }
  }).catch(() => {
  });
  ctx.effect(
    () => registerBuiltins(ctx, service, { terminalTitle: () => terminalTitle }),
    "dsh-better-sidebar: register built-in tabs and viewers"
  );
  const fail = (phase, error) => {
    console.error(`[dsh-better-sidebar] ${phase} error:`, error);
    try {
      const bar = document.createElement("div");
      bar.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:2147483000;max-width:70vw;padding:8px 12px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#f2a1a1;background:#1b1b22;border:1px solid #f2a1a1;border-radius:8px;white-space:pre-wrap";
      bar.textContent = `[dsh-better-sidebar] ${phase} error: ${error instanceof Error ? error.message : String(error)}`;
      document.body.appendChild(bar);
    } catch {
    }
  };
  try {
    resetChunks();
    ctx.effect(() => {
      let disposed = false;
      let root;
      let host;
      let mounted = false;
      const unmount = () => {
        if (!mounted) return;
        mounted = false;
        root?.unmount();
        root = void 0;
        host?.remove();
        host = void 0;
      };
      const mount = () => {
        if (mounted || disposed) return;
        try {
          host = document.createElement("div");
          host.setAttribute("data-dsh-better-sidebar", "");
          document.body.appendChild(host);
          root = (0, import_client.createRoot)(host);
          root.render((0, import_react21.createElement)(RenderBoundary, { className: dsh_inline_D_3A_5C_E5_B7_A5_E4_BD_9C_5CAI_E6_96_87_E4_BB_B6_5Cdeepseek_20harness_5Cdsh_better_sidebar_5Csrc_5Cclient_5Csidebar_module_css_default.boundaryError }, (0, import_react21.createElement)(Sidebar, { ctx, store: sidebarStore })));
          mounted = true;
        } catch (error) {
          fail("mount", error);
        }
      };
      const sync = async () => {
        if (disposed) return;
        const prefs = await Promise.race([
          loadPrefs(api),
          new Promise((resolve) => {
            const timer = window.setTimeout(() => resolve(null), 2e3);
          })
        ]);
        if (prefs !== null) sidebarStore.setPrefs(prefs);
        if (disposed) return;
        const suspended = await loadExternalDisable(api);
        if (disposed) return;
        sidebarStore.setSuspended(suspended);
        if (suspended) unmount();
        else mount();
      };
      void sync();
      const remote = ctx.get("remote");
      const offRemote = remote?.$on?.("settings/document-updated", () => {
        void sync();
      });
      return () => {
        disposed = true;
        offRemote?.();
        unmount();
      };
    }, "dsh-better-sidebar: sidebar mount");
    ctx.effect(
      () => {
        try {
          return registerTurnTailInterception(ctx, sidebarStore);
        } catch (error) {
          fail("interception", error);
          return void 0;
        }
      },
      "dsh-better-sidebar: turn-tail interception"
    );
    ctx.effect(
      () => {
        try {
          return registerOpenPathInterception(ctx, sidebarStore);
        } catch (error) {
          fail("interception", error);
          return void 0;
        }
      },
      "dsh-better-sidebar: open-path interception"
    );
    ctx.effect(
      () => {
        try {
          const urlTargetOf = (url) => {
            const prefs = sidebarStore.getPrefs();
            const enabled = service.getTabs().filter((tab) => prefs.tabsEnabled[tab.id] !== false);
            return matchUrlTarget(enabled, url)?.id;
          };
          return registerLinkInterception({
            takeoverEnabled: (url) => {
              if (sidebarStore.getSuspended()) return false;
              const prefs = sidebarStore.getPrefs();
              if (prefs.browserInterceptLinks === false) return false;
              const protocolOn = url.protocol === "https:" ? prefs.browserInterceptHttps !== false : prefs.browserInterceptHttp !== false;
              if (!protocolOn) return false;
              return urlTargetOf(url) !== void 0 || prefs.tabsEnabled["browser"] !== false;
            },
            openInSidebar: (url) => {
              let title;
              try {
                title = new URL(url).hostname;
              } catch {
              }
              const type = urlTargetOf(new URL(url)) ?? "browser";
              ctx.betterSidebar?.openTab({ type, url, title });
            },
            selfOrigin: window.location.origin
          });
        } catch (error) {
          fail("interception", error);
          return void 0;
        }
      },
      "dsh-better-sidebar: link interception"
    );
    ctx.effect(
      () => {
        try {
          return registerImeGuard();
        } catch (error) {
          fail("ime guard", error);
          return void 0;
        }
      },
      "dsh-better-sidebar: IME composition guard"
    );
    ctx.effect(
      () => registerSettingsNavIcon(() => t("settingsNav")),
      "dsh-better-sidebar: settings navigation icon"
    );
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "better-sidebar",
      order: 100,
      label: () => t("settingsNav"),
      inject: () => ({ store: sidebarStore, service })
    }, SideCardSection));
  } catch (error) {
    fail("load", error);
  }
}

    return module.exports;
  },
});
