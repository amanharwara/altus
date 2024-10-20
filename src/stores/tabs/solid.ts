import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import {
  TabStoreDefaults,
  type TabStore,
  type Tab,
  getDefaultTab,
} from "./common";
import { WebviewTag } from "electron";
import { createEffect } from "solid-js";

const [tabStore, _updateTabStore] = createStore<TabStore>(TabStoreDefaults());

createEffect(() => {
  for (const tab of tabStore.tabs) {
    const mediaPermsValue = tab.config.media;
    if (mediaPermsValue === undefined) {
      const defaultValue = getDefaultTab().config.media;
      updateAndSyncTabStore(
        "tabs",
        (t) => t.id === tab.id,
        "config",
        "media",
        defaultValue
      );
    }
  }
});

window.electronTabStore.getStore().then((store) => {
  if (store.tabs.length === 0) {
    const tab = getDefaultTab();
    store.tabs.push(tab);
    store.selectedTabId = tab.id;
  }
  if (!store.selectedTabId && store.tabs.length > 0) {
    store.selectedTabId = store.tabs[0].id;
  }
  _updateTabStore(store);
});

const updateAndSyncTabStore: SetStoreFunction<TabStore> = (
  ...args: unknown[]
) => {
  // @ts-expect-error Difficult to type, but works correctly
  _updateTabStore(...args);
  syncElectronTabStore();
};

function syncElectronTabStore() {
  const tabs = unwrap(tabStore.tabs);
  window.electronTabStore.set("tabs", tabs);

  const selectedTabId = unwrap(tabStore.selectedTabId);
  window.electronTabStore.set("selectedTabId", selectedTabId);

  const previouslyClosedTab = unwrap(tabStore.previouslyClosedTab);
  window.electronTabStore.set("previouslyClosedTab", previouslyClosedTab);
}

export function addTab(tab: Tab) {
  updateAndSyncTabStore("tabs", (tabs) => [...tabs, tab]);
  updateAndSyncTabStore("selectedTabId", tab.id);
}

export function removeTab(tab: Tab) {
  updateAndSyncTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
  updateAndSyncTabStore("previouslyClosedTab", tab);
  if (tabStore.tabs.length > 0) {
    updateAndSyncTabStore("selectedTabId", tabStore.tabs[0].id);
  } else {
    addTab(getDefaultTab());
  }
}

export function restoreTab() {
  const previouslyClosedTab = tabStore.previouslyClosedTab;
  if (previouslyClosedTab) {
    addTab(previouslyClosedTab);
    updateAndSyncTabStore("previouslyClosedTab", null);
  }
}

export function setTabActive(id: string) {
  updateAndSyncTabStore("selectedTabId", id);
}

export function getActiveWebviewElement() {
  const webviewElement = document.getElementById(
    `webview-${tabStore.selectedTabId}`
  ) as WebviewTag | null;
  return webviewElement;
}

export { tabStore, updateAndSyncTabStore };
