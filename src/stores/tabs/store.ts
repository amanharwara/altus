import { createStore } from "solid-js/store";
import { TabStoreDefaults, type TabStore, type Tab } from "./common";

const [tabStore, updateTabStore] = createStore<TabStore>(TabStoreDefaults());

window.electronTabStore.getTabs().then((tabs) => {
  updateTabStore("tabs", tabs);
});
window.electronTabStore
  .getPreviouslyClosedTab()
  .then((tab) => updateTabStore("previouslyClosedTab", tab));

export function addTab(tab: Tab) {
  updateTabStore("tabs", tabStore.tabs.length, tab);
}

export function removeTab(tab: Tab) {
  updateTabStore("tabs", (tabs) => tabs.filter((t) => t.id !== tab.id));
}

export { tabStore };
