<script lang="ts">
  import Tab from "./Tab.svelte";
  import { tabs } from "../store/store";
  const { ipcRenderer } = require("electron");

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
    tabs.update((tabs) => tabs.filter((tab) => tab.id !== id));
    activateTab({
      detail: {
        id: $tabs[0].id,
      },
    });
  };

  ipcRenderer.on("close-tab", () => {
    removeTab({
      detail: {
        id: $tabs.find((tab) => tab.active).id,
      },
    });
  });

  ipcRenderer.on("next-tab", () => {
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
  });

  ipcRenderer.on("previous-tab", () => {
    let activeTabIndex = $tabs.findIndex((tab) => tab.active);
    let previousId = null;
    if ($tabs[activeTabIndex - 1]) {
      previousId = $tabs[activeTabIndex - 1].id;
    }
    if (activeTabIndex === 0) {
      previousId = $tabs[$tabs.length - 1].id;
    }
    console.log(activeTabIndex, previousId);
    if (previousId) {
      activateTab({
        detail: {
          id: previousId,
        },
      });
    }
  });
</script>

<style>
  .tab-bar {
    background: #2c2d30;
    display: flex;
  }
</style>

<div class="tab-bar">
  {#if $tabs.length > 0}
    {#each $tabs as tab}
      <Tab {tab} on:activateTab={activateTab} on:removeTab={removeTab} />
    {/each}
  {/if}
  <div class="add-tab-button" />
</div>
