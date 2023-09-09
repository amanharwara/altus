import { For, type Component, createSignal } from "solid-js";
import { Tabs } from "@kobalte/core";
import { setTabActive, tabStore } from "./stores/tabs/solid";
import WebView from "./components/WebView";
import TabsList from "./components/TabsList";
import SettingsDialog from "./components/SettingsDialog";

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);

  window.electronIPCHandlers.onOpenSettings(() => {
    setIsSettingsOpen(true);
  });

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
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  );
};

export default App;
