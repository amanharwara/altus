import { createStore, unwrap } from "solid-js/store";
import { TabStoreDefaults, type TabStore, type Tab } from "./common";
import { createEffect } from "solid-js";

const [tabStore, updateTabStore] = createStore<TabStore>(TabStoreDefaults());

window.electronTabStore.getTabs().then((tabs) => {
  updateTabStore("tabs", tabs);
});
window.electronTabStore
  .getPreviouslyClosedTab()
  .then((tab) => updateTabStore("previouslyClosedTab", tab));

createEffect(() => {
  const tabs = unwrap(tabStore.tabs);
  window.electronTabStore.setTabs(tabs);
});

createEffect(() => {
  const previouslyClosedTab = unwrap(tabStore.previouslyClosedTab);
  window.electronTabStore.setPreviouslyClosedTab(previouslyClosedTab);
});

export function addTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => [...tabs, tab]);
}

export function removeTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
  updateTabStore("previouslyClosedTab", tab);
}

export { tabStore };
