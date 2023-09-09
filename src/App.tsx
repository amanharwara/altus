import { For, type Component, createSignal } from "solid-js";
import { tabStore } from "./stores/tabs/solid";
import WebView from "./components/WebView";
import TabsList from "./components/TabsList";
import SettingsDialog from "./components/SettingsDialog";
import { twJoin } from "tailwind-merge";
import { getSettingValue } from "./stores/settings/solid";

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);

  window.electronIPCHandlers.onOpenSettings(() => {
    setIsSettingsOpen(true);
  });

  return (
    <>
      <div
        class={twJoin(
          "h-full flex",
          getSettingValue("tabBarPosition") === "top"
            ? "flex-col"
            : "flex-col-reverse"
        )}
      >
        <TabsList />
        <For each={tabStore.tabs}>
          {(tab) => (
            <div
              class={twJoin(
                "min-h-0 flex-grow",
                tabStore.selectedTabId !== tab.id && "hidden"
              )}
            >
              <WebView tab={tab} />
            </div>
          )}
        </For>
      </div>
      <SettingsDialog isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
    </>
  );
};

export default App;
