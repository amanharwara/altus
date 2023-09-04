import { createStore, unwrap } from "solid-js/store";
import { TabStoreDefaults, type TabStore, type Tab } from "./common";
import { createEffect } from "solid-js";

// get whole store from ipc initially

const [tabStore, updateTabStore] = createStore<TabStore>(TabStoreDefaults());

window.electronTabStore.getStore().then((store) => {
  updateTabStore(store);
});

createEffect(() => {
  const tabs = unwrap(tabStore.tabs);
  window.electronTabStore.setTabs(tabs);
});

createEffect(() => {
  const previouslyClosedTab = unwrap(tabStore.previouslyClosedTab);
  window.electronTabStore.setPreviouslyClosedTab(previouslyClosedTab);
});

createEffect(() => {
  const selectedTabId = unwrap(tabStore.selectedTabId);
  window.electronTabStore.setSelectedTabId(selectedTabId);
});

export function addTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => [...tabs, tab]);
}

export function updateTab(tab: Tab) {
  updateTabStore("tabs", (tabs) =>
    tabs.map((t) => (t.id === tab.id ? tab : t))
  );
}

export function removeTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
  updateTabStore("previouslyClosedTab", tab);
}

export function setTabActive(id: string) {
  updateTabStore("selectedTabId", id);
}

export { tabStore };
