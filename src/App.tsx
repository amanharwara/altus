import { For, type Component, onMount } from "solid-js";
import { Tabs } from "@kobalte/core";
import { setTabActive, tabStore } from "./stores/tabs/store";
import { type Tab } from "./stores/tabs/common";
import { WebviewTag } from "electron";

const WebView: Component<{ tab: Tab }> = (props) => {
  const { tab } = props;

  let webviewRef: WebviewTag | undefined;

  onMount(() => {
    const webview = webviewRef;

    if (!webview) {
      return;
    }

    webview.addEventListener("dom-ready", () => {
      //
    });
  });

  return (
    <webview
      ref={webviewRef}
      class="w-full h-full"
      id={`webview-${tab.id}`}
      src="https://web.whatsapp.com"
      partition={`persist:${tab.id}`}
    />
  );
};

const App: Component = () => {
  return (
    <>
      <Tabs.Root
        value={tabStore.selectedTabId}
        onChange={setTabActive}
        class="h-full flex flex-col"
      >
        <Tabs.List class="flex bg-zinc-800">
          <For each={tabStore.tabs}>
            {(tab) => (
              <Tabs.Trigger
                class="bg-zinc-900 px-4 py-2.5 text-white text-basee leading-4 ui-selected:bg-gray-700"
                value={tab.id}
              >
                {tab.name}
              </Tabs.Trigger>
            )}
          </For>
        </Tabs.List>
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
