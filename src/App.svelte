<script lang="ts">
  import SettingsManager from "./components/SettingsManager.svelte";
  import TabBar from "./components/TabBar.svelte";
  import TabConfigModal from "./components/TabConfigModal.svelte";
  import TabContent from "./components/TabContent.svelte";
  import ThemeManager from "./components/ThemeManager.svelte";
  import { paths, modals } from "./store";
  import defaultTabSettings from "./util/defaultTabSettings";
  const { ipcRenderer } = require("electron");

  let tabSettings = defaultTabSettings();

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
</script>

<main>
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
  main {
    height: 100%;
  }
  .container {
    display: flex;
    flex-flow: column;
    height: 100%;
    position: relative;
  }
</style>
