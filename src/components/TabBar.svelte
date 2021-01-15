<script lang="ts">
  import Tab from "./Tab.svelte";
  import { tabs } from "../store";
  import Add from "./svg/Add.svelte";
  import { createEventDispatcher } from "svelte";
  const { ipcRenderer } = require("electron");

  let hidden = false;

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

  ipcRenderer.on("close-tab", () => {
    removeTab({
      detail: {
        id: $tabs.find((tab) => tab.active).id,
      },
    });
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
</script>

<div class="tab-bar" class:hidden>
  {#if $tabs.length > 0}
    <div class="tabs">
      {#each $tabs as tab}
        <Tab
          {tab}
          on:activateTab={activateTab}
          on:removeTab={removeTab}
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
