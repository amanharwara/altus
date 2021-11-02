<script lang="ts">
  import { onMount } from "svelte";

  import CustomTitlebar from "./components/CustomTitlebar.svelte";
  import NewChatModal from "./components/NewChatModal.svelte";
  import SettingsManager from "./components/SettingsManager.svelte";
  import TabBar from "./components/TabBar.svelte";
  import TabConfigModal from "./components/TabConfigModal.svelte";
  import TabContent from "./components/TabContent.svelte";
  import ThemeManager from "./components/ThemeManager.svelte";
  import { paths, currentModal, ModalType, settings } from "./store";
  import defaultTabSettings from "./util/defaultTabSettings";
  const { ipcRenderer } = require("electron");

  let tabSettings = defaultTabSettings();

  const settingsChanged = ({ detail }) => {
    detail.forEach((setting) => {
      ipcRenderer.send(setting.id, setting.value);
    });
  };

  ipcRenderer.on("new-chat", () => {
    currentModal.set(ModalType.NewChatModal);
  });

  ipcRenderer.on("open-theme-manager", () => {
    currentModal.set(ModalType.ThemeManager);
  });

  ipcRenderer.on("open-settings", () => {
    currentModal.set(ModalType.SettingsManager);
  });

  ipcRenderer.on("userDataPath", (path) => {
    $paths = {
      ...$paths,
      userData: path as any,
    };
  });

  ipcRenderer.on("cleared-tab-cache", () => {
    alert("Cleared tab cache.");
  });

  ipcRenderer.on("cleared-all-cache", () => {
    alert("Cleared all cache.");
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
    <div
      class={`flex ${
        $settings["tabBarPosition"].value === "top"
          ? "flex-col"
          : "flex-col-reverse"
      }`}
    >
      <TabBar
        on:add-tab={() => {
          currentModal.set(ModalType.TabConfig);
          tabSettings = defaultTabSettings();
        }}
        on:edit-tab={(e) => {
          tabSettings = e.detail.tabToEdit;
          currentModal.set(ModalType.TabConfig);
        }}
      />
      <TabContent />
    </div>
    <SettingsManager
      visible={$currentModal === ModalType.SettingsManager}
      on:settings-changed={settingsChanged}
    />
    <ThemeManager visible={$currentModal === ModalType.ThemeManager} />
    <TabConfigModal
      visible={$currentModal === ModalType.TabConfig}
      {tabSettings}
      on:close-modal={() => {
        currentModal.set(null);
        tabSettings = defaultTabSettings();
      }}
    />
    <!-- <NewChatModal visible={$currentModal === ModalType.NewChatModal} /> -->
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
  .flex {
    display: flex;
    flex-grow: 1;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-col-reverse {
    flex-direction: column-reverse;
  }
  :global(.hasTitlebar .modal-container) {
    top: auto;
    bottom: 0;
    height: calc(100% - 32px);
  }
</style>
