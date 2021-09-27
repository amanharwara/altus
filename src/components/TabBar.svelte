<script lang="ts">
  import Tab from "./Tab.svelte";
  import {
    currentModal,
    ModalType,
    previouslyClosedTab,
    settings,
    tabs,
  } from "../store";
  import Add from "./svg/Add.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  import arrayMove from "../util/arrayMove";
  const { ipcRenderer } = require("electron");
  const Dragula = require("dragula");
  const Store = require("electron-store");

  let tabStore = new Store({
    name: "tabs",
  });

  let hidden = false;

  $: hidden = !$settings["tabBar"].value;

  const dispatchEvent = createEventDispatcher();

  const activateTab = (e) => {
    let { id } = e.detail;
    tabs.update((tabs) =>
      tabs.map((tab) => {
        return { ...tab, active: tab.id === id ? true : false };
      })
    );
  };

  const removeTab = (e) => {
    let { id } = e.detail;
    let currentTabIndex = $tabs.findIndex((tab) => tab.id === id);
    if (currentTabIndex !== -1) {
      let currentTab = $tabs[currentTabIndex];
      let nextId = null;
      tabs.update((tabs) => tabs.filter((tab) => tab.id !== id));
      previouslyClosedTab.set(currentTab);
      if (currentTab.active && $tabs.length > 0) {
        nextId = $tabs[currentTabIndex - 1]
          ? $tabs[currentTabIndex - 1].id
          : $tabs[0].id;
        if (nextId) {
          activateTab({
            detail: {
              id: nextId,
            },
          });
        }
      }
    }
  };

  const editTab = (e) => {
    dispatchEvent("edit-tab", {
      tabToEdit: $tabs.find((tab) => tab.id === e.detail.id),
    });
  };

  const activateNextTab = () => {
    let activeTabIndex = $tabs.findIndex((tab) => tab.active);
    let nextId = null;
    if ($tabs[activeTabIndex + 1]) {
      nextId = $tabs[activeTabIndex + 1].id;
    }
    if (activeTabIndex === $tabs.length - 1) {
      nextId = $tabs[0].id;
    }
    if (nextId) {
      activateTab({
        detail: {
          id: nextId,
        },
      });
    }
  };

  const activatePreviousTab = () => {
    let activeTabIndex = $tabs.findIndex((tab) => tab.active);
    let previousId = null;
    if ($tabs[activeTabIndex - 1]) {
      previousId = $tabs[activeTabIndex - 1].id;
    }
    if (activeTabIndex === 0) {
      previousId = $tabs[$tabs.length - 1].id;
    }
    if (previousId) {
      activateTab({
        detail: {
          id: previousId,
        },
      });
    }
  };

  const promptBeforeClosingTab = (id) => {
    if ($settings["tabClosePrompt"].value) {
      ipcRenderer.send("prompt-close-tab", id);
    } else {
      removeTab({ detail: { id } });
    }
  };

  ipcRenderer.on("prompt-before-closing-tab", () => {
    promptBeforeClosingTab($tabs.find((tab) => tab.active).id);
  });

  ipcRenderer.on("add-new-tab", () => {
    dispatchEvent("add-tab");
  });

  ipcRenderer.on("edit-tab", () => {
    editTab({
      detail: {
        id: $tabs.find((tab) => tab.active).id,
      },
    });
  });

  ipcRenderer.on("open-tab-devtools", () => {
    (document as any).querySelector(".content.active webview").openDevTools();
  });

  ipcRenderer.on("close-tab", (e, id) => {
    if (id) {
      removeTab({
        detail: {
          id,
        },
      });
    } else {
      removeTab({
        detail: {
          id: $tabs.find((tab) => tab.active).id,
        },
      });
    }
  });

  ipcRenderer.on("restore-tab", () => {
    if ($previouslyClosedTab && $previouslyClosedTab.id) {
      tabs.update((tabs) =>
        tabs
          .map((tab) => {
            return { ...tab, active: false };
          })
          .concat([
            {
              ...$previouslyClosedTab,
              active: true,
            },
          ])
      );
      previouslyClosedTab.set(null);
      currentModal.set(null);
    }
  });

  ipcRenderer.on("next-tab", activateNextTab);
  ipcRenderer.on("previous-tab", activatePreviousTab);

  ipcRenderer.on("first-tab", () => {
    activateTab({ detail: { id: $tabs[0].id } });
  });
  ipcRenderer.on("last-tab", () => {
    activateTab({ detail: { id: $tabs[$tabs.length - 1].id } });
  });

  ipcRenderer.on("toggle-tab-bar", () => {
    hidden = !hidden;
  });

  ipcRenderer.on("message-indicator", (e, detail) => {
    let { messageCount, tabId } = detail;
    $tabs = $tabs.map((tab) => {
      if (tab.id === tabId) {
        return {
          ...tab,
          messageCount,
        };
      } else {
        return tab;
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case "PageUp":
          activatePreviousTab();
          break;
        case "PageDown":
          activateNextTab();
          break;
      }
      if (parseInt(e.key)) {
        let key = parseInt(e.key);
        if ($tabs[key - 1]) {
          activateTab({ detail: { id: $tabs[key - 1].id } });
        }
      }
    }
  });

  let tabsContainerRef;

  onMount(() => {
    let tabDrake = Dragula([tabsContainerRef], {
      direction: "horizontal",
    });
    tabDrake.on("dragend", (element) => {
      let id = element.id;
      let tabsArray = tabStore.get("tabs");
      if (tabsArray) {
        let oldIndex = tabsArray.findIndex((tab) => tab.id === id);
        let domTabs = Array.from(document.querySelectorAll(".tab"));
        let newIndex = domTabs.findIndex((tab) => tab.id === id);
        let newTabsArray = arrayMove(tabsArray, oldIndex, newIndex);
        tabStore.set("tabs", newTabsArray);
      }
    });
  });
</script>

<div class="tab-bar" class:hidden>
  {#if $tabs.length > 0}
    <div class="tabs" bind:this={tabsContainerRef}>
      {#each $tabs as tab}
        <Tab
          {tab}
          on:activateTab={activateTab}
          on:removeTab={(e) => {
            let { id } = e.detail;
            promptBeforeClosingTab(id);
          }}
          on:editTab={editTab}
        />
      {/each}
    </div>
  {/if}
  <div class="add-tab" on:click={() => dispatchEvent("add-tab")}>
    <Add />
  </div>
</div>

<style>
  .tab-bar {
    background: #2c2d30;
    display: flex;
  }
  .tabs {
    display: flex;
    overflow-x: auto;
  }
  .tabs::-webkit-scrollbar {
    height: 5px;
  }
  .tabs::-webkit-scrollbar-thumb {
    background: #36475d;
  }
  .add-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.65rem;
    background: #383c49;
    fill: #fff;
    cursor: pointer;
    transition: background 0.15s;
  }
  .add-tab:hover {
    background: #2d303a;
  }
  .add-tab :global(svg) {
    width: 1.35rem;
  }
  .hidden {
    display: none;
  }
</style>
