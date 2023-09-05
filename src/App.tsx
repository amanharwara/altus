import { For, type Component } from "solid-js";
import { Tabs } from "@kobalte/core";
import { setTabActive, tabStore } from "./stores/tabs/solid";
import WebView from "./components/WebView";
import TabsList from "./components/TabsList";

const App: Component = () => {
  return (
    <>
      <Tabs.Root
        value={tabStore.selectedTabId}
        onChange={setTabActive}
        class="h-full flex flex-col"
      >
        <TabsList />
        <For each={tabStore.tabs}>
          {(tab) => (
            <Tabs.Content class="min-h-0 flex-grow" value={tab.id}>
              <WebView tab={tab} />
            </Tabs.Content>
          )}
        </For>
      </Tabs.Root>
    </>
  );
};

export default App;
