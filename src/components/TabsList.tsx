import { Dialog } from "@kobalte/core";
import {
  Accessor,
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import {
  addTab,
  getActiveWebviewElement,
  moveTabToIndex,
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
  index: Accessor<number>;
  setTabToEdit: (tab: Tab | null) => void;
  removeTab: (tab: Tab) => void;
}

const [draggedTab, setDraggedTab] = createSignal<{
  id: string;
  index: number;
}>();

const TabComponent: Component<TabComponentProps> = (props) => {
  const [messageCount, setMessageCount] = createSignal(0);

  const cleanupListener = window.electronIPCHandlers.onMessageCount(
    ({ messageCount, tabId }) => {
      if (tabId === props.tab.id) {
        setMessageCount(messageCount);
      }
    }
  );
  onCleanup(cleanupListener);

  const [willDrop, setWillDrop] = createSignal<"before" | "after" | false>(
    false
  );
  createEffect(() => {
    if (!draggedTab()) {
      setWillDrop(false);
    }
  });
  const [isDragging, setIsDragging] = createSignal(false);
  const isSelected = () => props.tab.id === tabStore.selectedTabId;

  let tab: HTMLDivElement | undefined;

  return (
    <div
      role="tab"
      ref={tab}
      id={props.tab.id}
      aria-controls={`tabpanel-${props.tab.id}`}
      aria-selected={isSelected() ? "true" : "false"}
      class="group flex flex-shrink-0 items-center gap-1.5 bg-zinc-800 px-3 py-1.5 text-white text-sm leading-4 ui-selected:bg-zinc-700 hover:bg-zinc-600 select-none"
      classList={{
        "opacity-50": isDragging(),
        "border-l-2 border-blue-500": willDrop() === "before",
        "border-r-2 border-blue-500": willDrop() === "after",
      }}
      style={
        props.tab.config.color
          ? {
              background: props.tab.config.color,
            }
          : {}
      }
      onClick={() => setTabActive(props.tab.id)}
      data-selected={isSelected() ? "" : undefined}
      draggable={true}
      onDragStart={(event) => {
        if (!event.dataTransfer) return;
        setDraggedTab({
          id: props.tab.id,
          index: props.index(),
        });
        event.dataTransfer.dropEffect = "move";
        setIsDragging(true);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        setDraggedTab(undefined);
        setTabActive(props.tab.id);
      }}
      onDragEnter={() => {
        const _draggedTab = draggedTab();
        if (!_draggedTab) return;
        const currentIndex = props.index();
        const draggedTabIndex = _draggedTab.index;
        if (currentIndex > draggedTabIndex) setWillDrop("after");
        else if (currentIndex < draggedTabIndex) setWillDrop("before");
        else setWillDrop(false);
      }}
      onDragLeave={(event) => {
        if (draggedTab()?.id === props.tab.id) return;
        if (
          event.relatedTarget instanceof Node &&
          tab?.contains(event.relatedTarget)
        )
          return;
        setWillDrop(false);
      }}
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

  const handlers = new Set<() => void>();
  onCleanup(() => {
    for (const cleanup of handlers) {
      cleanup();
    }
  });

  handlers.add(
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
    })
  );

  handlers.add(
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
    })
  );

  handlers.add(
    window.electronIPCHandlers.onFirstTab(() => {
      const firstTab = tabStore.tabs[0];
      if (!firstTab) return;
      setTabActive(firstTab.id);
    })
  );

  handlers.add(
    window.electronIPCHandlers.onLastTab(() => {
      const lastTab = tabStore.tabs[tabStore.tabs.length - 1];
      if (!lastTab) return;
      setTabActive(lastTab.id);
    })
  );

  handlers.add(
    window.electronIPCHandlers.onOpenWhatsappLink((url) => {
      const activeWebview = getActiveWebviewElement();
      if (!activeWebview) return;
      activeWebview.src = url;
    })
  );

  handlers.add(
    window.electronIPCHandlers.onOpenTabDevTools(() => {
      const activeWebview = getActiveWebviewElement();
      if (!activeWebview) return;
      activeWebview.openDevTools();
    })
  );

  handlers.add(
    window.electronIPCHandlers.onEditActiveTab(() => {
      const activeTab = tabStore.tabs.find(
        (tab) => tab.id === tabStore.selectedTabId
      );
      if (!activeTab) return;
      setTabToEdit(activeTab);
    })
  );

  handlers.add(
    window.electronIPCHandlers.onCloseActiveTab(() => {
      const activeTab = tabStore.tabs.find(
        (tab) => tab.id === tabStore.selectedTabId
      );
      if (!activeTab) return;
      removeTabWithPrompt(activeTab);
    })
  );

  handlers.add(
    window.electronIPCHandlers.onAddNewTab(() => {
      addNewTab();
    })
  );

  handlers.add(
    window.electronIPCHandlers.onRestoreTab(() => {
      restoreTab();
    })
  );

  handlers.add(
    window.electronIPCHandlers.onNewChat(() => {
      setShowNewChatDialog(true);
    })
  );

  return (
    <>
      <div
        class={twJoin(
          "bg-zinc-800 divide-x divide-zinc-700/20 w-full",
          getSettingValue("tabBar") ? "flex" : "hidden"
        )}
      >
        <div
          role="tablist"
          class="tabs-list flex overflow-x-auto"
          onDragEnter={(event) => {
            if (!event.dataTransfer) return;
            const isDraggingTab = !!draggedTab;
            if (isDraggingTab) event.preventDefault();
          }}
          onDragOver={(event) => {
            if (!event.dataTransfer) return;
            const isDraggingTab = !!draggedTab;
            if (isDraggingTab) event.preventDefault();
          }}
          onDrop={(event) => {
            const droppedOnTab = event.target.closest('[role="tab"]');
            if (!droppedOnTab) return;
            const _draggedTab = draggedTab();
            if (!_draggedTab) return;
            const draggedTabID = _draggedTab.id;
            const droppedOnTabID = droppedOnTab.id;
            if (draggedTabID === droppedOnTabID) {
              return;
            }
            const tabs = tabStore.tabs;
            const draggedTabIndex = tabs.findIndex(
              (t) => t.id === draggedTabID
            );
            const droppedOnTabIndex = tabs.findIndex(
              (t) => t.id === droppedOnTabID
            );
            moveTabToIndex(draggedTabIndex, droppedOnTabIndex);
            event.preventDefault();
          }}
        >
          <For each={tabStore.tabs}>
            {(tab, index) => (
              <TabComponent
                tab={tab}
                index={index}
                setTabToEdit={setTabToEdit}
                removeTab={removeTabWithPrompt}
              />
            )}
          </For>
        </div>
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
