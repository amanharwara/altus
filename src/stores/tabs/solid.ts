import { createStore, unwrap } from "solid-js/store";
import { TabStoreDefaults, type TabStore, type Tab } from "./common";
import { createEffect, on } from "solid-js";

const [tabStore, updateTabStore] = createStore<TabStore>(TabStoreDefaults());

window.electronTabStore.getStore().then((store) => {
  updateTabStore(store);
});

createEffect(() => {
  const tabs = unwrap(tabStore.tabs);
  window.electronTabStore.setTabs(tabs);
});

createEffect(
  on(
    () => tabStore.previouslyClosedTab,
    () => {
      const previouslyClosedTab = unwrap(tabStore.previouslyClosedTab);
      window.electronTabStore.setPreviouslyClosedTab(previouslyClosedTab);
    },
    {
      defer: true,
    }
  )
);

createEffect(() => {
  const selectedTabId = unwrap(tabStore.selectedTabId);
  window.electronTabStore.setSelectedTabId(selectedTabId);
});

export function addTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => [...tabs, tab]);
  updateTabStore("selectedTabId", tab.id);
}

export function removeTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
  updateTabStore("previouslyClosedTab", tab);
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

export { tabStore, updateTabStore };
