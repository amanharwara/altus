<script lang="ts">
  import { onMount } from "svelte";

  import CustomTitlebar from "./components/CustomTitlebar.svelte";
  import SettingsManager from "./components/SettingsManager.svelte";
  import TabBar from "./components/TabBar.svelte";
  import TabConfigModal from "./components/TabConfigModal.svelte";
  import TabContent from "./components/TabContent.svelte";
  import ThemeManager from "./components/ThemeManager.svelte";
  import { paths, modals, settings, tabs } from "./store";
  import defaultTabSettings from "./util/defaultTabSettings";
  const { ipcRenderer } = require("electron");

  let tabSettings = defaultTabSettings();

  const settingsChanged = ({ detail }) => {
    detail.forEach((setting) => {
      ipcRenderer.send(setting.id, setting.value);
    });
  };

  ipcRenderer.on("open-theme-manager", () => {
    $modals.themeManagerVisible = true;
  });

  ipcRenderer.on("open-settings", () => {
    $modals.settingsManagerVisible = true;
  });

  ipcRenderer.on("userDataPath", (path) => {
    $paths = {
      ...$paths,
      userData: path,
    };
  });

  let showTitlebar = false;

  onMount(() => {
    if ($settings["customTitlebar"]?.value) {
      document.body.style.border = "1px solid #1f1f20e7";
      document.body.style.overflow = "hidden";
      document.querySelector("main").classList.add("hasTitlebar");
      showTitlebar = true;
    } else {
      document.body.style.border = "";
      document.body.style.overflow = "";
      document.querySelector("main").classList.remove("hasTitlebar");
      showTitlebar = false;
    }
  });
</script>

<main>
  {#if showTitlebar}
    <CustomTitlebar />
  {/if}
  <div class="container">
    <TabBar
      on:add-tab={() => {
        $modals.tabConfigModalVisible = true;
        tabSettings = defaultTabSettings();
      }}
      on:edit-tab={(e) => {
        tabSettings = e.detail.tabToEdit;
        $modals.tabConfigModalVisible = true;
      }}
    />
    <TabContent />
    <SettingsManager
      visible={$modals.settingsManagerVisible}
      on:settings-changed={settingsChanged}
      on:close-settings-manager={() => {
        $modals.settingsManagerVisible = false;
      }}
    />
    <ThemeManager
      visible={$modals.themeManagerVisible}
      on:close-theme-manager={() => {
        $modals.themeManagerVisible = false;
      }}
    />
    <TabConfigModal
      visible={$modals.tabConfigModalVisible}
      {tabSettings}
      on:close-tab-config-modal={() => {
        $modals.tabConfigModalVisible = false;
        tabSettings = defaultTabSettings();
      }}
    />
  </div>
</main>

<style>
  main,
  .container {
    height: 100%;
    display: flex;
    flex-flow: column;
  }
  main {
    z-index: 0;
  }
  .container {
    flex-grow: 1;
  }
  :global(.hasTitlebar .modal-container) {
    top: auto;
    bottom: 0;
    height: calc(100% - 32px);
  }
</style>
