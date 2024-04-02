import { Dialog } from "@kobalte/core";
import { Component, For, Show, createSignal } from "solid-js";
import {
  addTab,
  getActiveWebviewElement,
  removeTab,
  restoreTab,
  setTabActive,
  tabStore,
} from "../stores/tabs/solid";
import { Tab, getDefaultTab } from "../stores/tabs/common";
import CloseIcon from "../icons/CloseIcon";
import SettingsIcon from "../icons/SettingsIcon";
import TabEditDialog from "./TabEditDialog";
import { twJoin } from "tailwind-merge";
import { getSettingValue } from "../stores/settings/solid";
import NewChatDialog from "./NewChatDialog";

interface TabComponentProps {
  tab: Tab;
  setTabToEdit: (tab: Tab | null) => void;
  removeTab: (tab: Tab) => void;
}

const TabComponent: Component<TabComponentProps> = (props) => {
  const [messageCount, setMessageCount] = createSignal(0);

  window.electronIPCHandlers.onMessageCount(({ messageCount, tabId }) => {
    if (tabId === props.tab.id) {
      setMessageCount(messageCount);
    }
  });

  return (
    <div
      class="group flex flex-shrink-0 items-center gap-1.5 bg-zinc-800 px-3 py-1.5 text-white text-sm leading-4 ui-selected:bg-zinc-700 hover:bg-zinc-600 select-none"
      style={
        props.tab.config.color
          ? {
              background: props.tab.config.color,
            }
          : {}
      }
      onClick={() => setTabActive(props.tab.id)}
      data-selected={props.tab.id === tabStore.selectedTabId ? "" : undefined}
    >
      {!!messageCount() && (
        <div class="flex items-center justify-center leading-none w-[4ch] h-5 bg-red-600 text-white rounded-full text-[length:0.65rem] mr-0.5">
          {messageCount() > 99 ? "99+" : messageCount()}
        </div>
      )}
      <span>{props.tab.name}</span>
      <button
        class="flex items-center justify-center ml-0.5 w-6 h-6 hover:bg-zinc-800/50 rounded group-data-[selected]:hover:bg-zinc-800/50"
        onClick={() => {
          props.setTabToEdit(props.tab);
        }}
      >
        <SettingsIcon class="w-4 h-4" />
      </button>
      <button
        class="flex items-center justify-center w-6 h-6 hover:bg-zinc-800/50 rounded group-data-[selected]:hover:bg-zinc-800/50"
        onClick={() => {
          props.removeTab(props.tab);
        }}
      >
        <CloseIcon class="w-5 h-5" />
      </button>
    </div>
  );
};

const TabsList: Component = () => {
  const [tabToEdit, setTabToEdit] = createSignal<Tab | null>(null);
  const canShowTabEditDialog = () => tabToEdit() !== null;

  const [canShowNewChatDialog, setShowNewChatDialog] = createSignal(false);

  const addNewTab = () => {
    addTab(getDefaultTab());
  };

  const removeTabWithPrompt = async (tab: Tab) => {
    const requiresPrompt = getSettingValue("tabClosePrompt");
    if (!requiresPrompt) {
      removeTab(tab);
      return;
    }
    const result = await window.showMessageBox({
      type: "question",
      buttons: ["OK", "Cancel"],
      title: "Close Tab",
      message: "Are you sure you want to close the tab?",
    });
    if (result.response === 0) {
      removeTab(tab);
    }
  };

  window.electronIPCHandlers.onNextTab(() => {
    const activeTabIndex = tabStore.tabs.findIndex(
      (tab) => tab.id === tabStore.selectedTabId
    );
    if (activeTabIndex === -1) return;
    const nextIndex = activeTabIndex + 1;
    if (nextIndex >= tabStore.tabs.length) {
      setTabActive(tabStore.tabs[0].id);
      return;
    }
    setTabActive(tabStore.tabs[nextIndex].id);
  });

  window.electronIPCHandlers.onPreviousTab(() => {
    const activeTabIndex = tabStore.tabs.findIndex(
      (tab) => tab.id === tabStore.selectedTabId
    );
    if (activeTabIndex === -1) return;
    const previousIndex = activeTabIndex - 1;
    if (previousIndex < 0) {
      setTabActive(tabStore.tabs[tabStore.tabs.length - 1].id);
      return;
    }
    setTabActive(tabStore.tabs[previousIndex].id);
  });

  window.electronIPCHandlers.onFirstTab(() => {
    const firstTab = tabStore.tabs[0];
    if (!firstTab) return;
    setTabActive(firstTab.id);
  });

  window.electronIPCHandlers.onLastTab(() => {
    const lastTab = tabStore.tabs[tabStore.tabs.length - 1];
    if (!lastTab) return;
    setTabActive(lastTab.id);
  });

  window.electronIPCHandlers.onOpenWhatsappLink((url) => {
    const activeWebview = getActiveWebviewElement();
    if (!activeWebview) return;
    activeWebview.src = url;
  });

  window.electronIPCHandlers.onOpenTabDevTools(() => {
    const activeWebview = getActiveWebviewElement();
    if (!activeWebview) return;
    activeWebview.openDevTools();
  });

  window.electronIPCHandlers.onEditActiveTab(() => {
    const activeTab = tabStore.tabs.find(
      (tab) => tab.id === tabStore.selectedTabId
    );
    if (!activeTab) return;
    setTabToEdit(activeTab);
  });

  window.electronIPCHandlers.onCloseActiveTab(() => {
    const activeTab = tabStore.tabs.find(
      (tab) => tab.id === tabStore.selectedTabId
    );
    if (!activeTab) return;
    removeTabWithPrompt(activeTab);
  });

  window.electronIPCHandlers.onAddNewTab(() => {
    addNewTab();
  });

  window.electronIPCHandlers.onRestoreTab(() => {
    restoreTab();
  });

  window.electronIPCHandlers.onNewChat(() => {
    setShowNewChatDialog(true);
  });

  return (
    <>
      <div
        class={twJoin(
          "tabs-list bg-zinc-800 divide-x divide-zinc-700/20 overflow-x-auto w-full",
          getSettingValue("tabBar") ? "flex" : "hidden"
        )}
      >
        <For each={tabStore.tabs}>
          {(tab) => (
            <TabComponent
              tab={tab}
              setTabToEdit={setTabToEdit}
              removeTab={removeTabWithPrompt}
            />
          )}
        </For>
        <button
          class="group flex items-center gap-2.5 bg-zinc-800 px-3 py-2 text-white text-sm leading-4 ui-selected:bg-zinc-700 hover:bg-zinc-600 select-none"
          onClick={addNewTab}
        >
          <div class="sr-only">Add new tab</div>
          <CloseIcon class="w-4 h-4 rotate-45" />
        </button>
      </div>
      <Dialog.Root
        open={canShowTabEditDialog()}
        onOpenChange={(open) => {
          if (!open) {
            setTabToEdit(null);
          }
        }}
      >
        <Show when={tabToEdit()}>
          {(tabToEdit) => (
            <TabEditDialog tabToEdit={tabToEdit} setTabToEdit={setTabToEdit} />
          )}
        </Show>
      </Dialog.Root>
      <Dialog.Root
        open={canShowNewChatDialog()}
        onOpenChange={setShowNewChatDialog}
      >
        <Show when={canShowNewChatDialog()}>
          <NewChatDialog
            close={() => {
              setShowNewChatDialog(false);
            }}
          />
        </Show>
      </Dialog.Root>
    </>
  );
};

export default TabsList;
