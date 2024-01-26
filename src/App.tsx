import { For, type Component, createSignal, createResource } from "solid-js";
import { tabStore } from "./stores/tabs/solid";
import WebView from "./components/WebView";
import TabsList from "./components/TabsList";
import SettingsDialog from "./components/SettingsDialog";
import { twJoin } from "tailwind-merge";
import { getSettingValue } from "./stores/settings/solid";
import CustomTitlebar from "./components/CustomTitlebar";
import { I18NProvider } from "./i18n/solid";
import ThemeManagerDialog from "./components/ThemeManagerDialog";

const App: Component = () => {
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [isThemeManagerOpen, setIsThemeManagerOpen] = createSignal(false);
  const [menu, { refetch: refetchAppMenu }] = createResource(window.getAppMenu);

  window.electronIPCHandlers.onOpenSettings(() => {
    setIsSettingsOpen(true);
  });
  window.electronIPCHandlers.onOpenThemeManager(() => {
    setIsThemeManagerOpen(true);
  });

  window.electronIPCHandlers.onReloadCustomTitleBar(refetchAppMenu);

  return (
    <I18NProvider>
      <div class="flex flex-col h-full">
        {getSettingValue("customTitlebar") && window.platform !== "darwin" && (
          <CustomTitlebar menu={menu} />
        )}
        <div
          class={twJoin(
            "h-full flex overflow-hidden",
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
        <ThemeManagerDialog
          isOpen={isThemeManagerOpen}
          setIsOpen={setIsThemeManagerOpen}
        />
      </div>
    </I18NProvider>
  );
};

export default App;
