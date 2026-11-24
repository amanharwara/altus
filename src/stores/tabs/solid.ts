import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import equal from "fast-deep-equal";
import {
  TabStoreDefaults,
  type TabStore,
  type Tab,
  getDefaultTab,
} from "./common";
import { WebviewTag } from "electron";
import { createEffect, createMemo } from "solid-js";

const [tabStore, _updateTabStore] = createStore<TabStore>(TabStoreDefaults());

/**
 * Used to make sure the rendered webviews are not moved when a tab is drag-n-dropped.
 */
export const stableTabArray = createMemo(() => {
  return tabStore.tabs.toSorted((a, b) =>
    a.id > b.id ? 1 : a.id < b.id ? -1 : 0
  );
});

createEffect(() => {
  for (const tab of tabStore.tabs) {
    const mediaPermsValue = tab.config.media;
    if (mediaPermsValue === undefined) {
      const defaultValue = getDefaultTab().config.media;
      updateTabStore(
        "tabs",
        (t) => t.id === tab.id,
        "config",
        "media",
        defaultValue
      );
    }
  }
});

const dirtyKeys = new Set<keyof TabStore>();
let scheduledFlushHandle: number | null = null;
const lastPersisted = new Map<keyof TabStore, unknown>();

const updateTabStore: SetStoreFunction<TabStore> = (...args: unknown[]) => {
  // @ts-expect-error Difficult to type, but works correctly
  _updateTabStore(...args);
  markDirtyKey(args[0]);
  scheduleTabStoreFlush();
};

function markDirtyKey(path: unknown) {
  if (typeof path === "string" && path in tabStore) {
    dirtyKeys.add(path as keyof TabStore);
    return;
  }

  dirtyKeys.add("tabs");
  dirtyKeys.add("selectedTabId");
  dirtyKeys.add("previouslyClosedTab");
}

function clonePersistedValue<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value)) as T;
  }

  return value;
}

function updateLastPersistedSnapshot(snapshot: Partial<TabStore>) {
  for (const key of Object.keys(snapshot) as (keyof TabStore)[]) {
    lastPersisted.set(key, clonePersistedValue(snapshot[key]));
  }
}

function clearScheduledFlush() {
  if (scheduledFlushHandle === null) {
    return;
  }

  if ("cancelIdleCallback" in window && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(scheduledFlushHandle);
  } else {
    window.clearTimeout(scheduledFlushHandle);
  }

  scheduledFlushHandle = null;
}

function scheduleTabStoreFlush() {
  if (scheduledFlushHandle !== null) {
    return;
  }

  if ("requestIdleCallback" in window && typeof window.requestIdleCallback === "function") {
    scheduledFlushHandle = window.requestIdleCallback(() => {
      scheduledFlushHandle = null;
      flushTabStoreToElectron();
    });
    return;
  }

  scheduledFlushHandle = window.setTimeout(() => {
    scheduledFlushHandle = null;
    flushTabStoreToElectron();
  }, 0);
}

export function flushTabStoreToElectron() {
  clearScheduledFlush();
  if (dirtyKeys.size === 0) {
    return;
  }

  const currentSnapshot = unwrap(tabStore);
  const keysToFlush = Array.from(dirtyKeys);
  dirtyKeys.clear();

  for (const key of keysToFlush) {
    const currentValue = currentSnapshot[key];
    const previousValue = lastPersisted.get(key);

    if (!equal(currentValue, previousValue)) {
      lastPersisted.set(key, clonePersistedValue(currentValue));
      // On IPC failure, forget the persisted value and re-mark dirty so the
      // next flush (any later change or beforeunload) retries instead of losing it.
      Promise.resolve(window.electronTabStore.set(key, currentValue)).catch(
        (error) => {
          console.error(`Failed to persist tab store key "${key}"`, error);
          lastPersisted.delete(key);
          dirtyKeys.add(key);
        }
      );
    }
  }
}

window.addEventListener("beforeunload", () => {
  clearScheduledFlush();
  flushTabStoreToElectron();
});

window.electronTabStore.getStore().then((store) => {
  _updateTabStore(store);
  updateLastPersistedSnapshot(store);

  if (store.tabs.length === 0) {
    addTab(getDefaultTab());
  } else if (!store.selectedTabId && store.tabs.length > 0) {
    setTabActive(store.tabs[0].id);
  }
});

export function addTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => [...tabs, tab]);
  updateTabStore("selectedTabId", tab.id);
}

export function removeTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
  updateTabStore("previouslyClosedTab", tab);
  if (tabStore.tabs.length > 0) {
    updateTabStore("selectedTabId", tabStore.tabs[0].id);
  } else {
    addTab(getDefaultTab());
  }
}

export function moveTabToIndex(from: number, to: number) {
  updateTabStore("tabs", (_tabs) => {
    const tabs = _tabs.slice();
    const [splicedTab] = tabs.splice(from, 1);
    tabs.splice(to, 0, splicedTab);
    return tabs;
  });
}

export function restoreTab() {
  const previouslyClosedTab = tabStore.previouslyClosedTab;
  if (previouslyClosedTab) {
    addTab(previouslyClosedTab);
    updateTabStore("previouslyClosedTab", null);
  }
}

export function setTabActive(id: string) {
  updateTabStore("selectedTabId", id);
}

export function getActiveWebviewElement() {
  const webviewElement = document.getElementById(
    `webview-${tabStore.selectedTabId}`
  ) as WebviewTag | null;
  return webviewElement;
}

export { tabStore, updateTabStore };
