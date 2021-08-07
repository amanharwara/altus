<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import Close from "./svg/Close.svelte";
  import Spinner from "./svg/Spinner.svelte";
  import Toggle from "./common/Toggle.svelte";
  import { settings } from "../store";
  import { get } from "svelte/store";
  import Import from "./svg/Import.svelte";
  import Export from "./svg/Export.svelte";
  import { migrateSettings } from "../store/settings";
  const { ipcRenderer } = require("electron");
  export let visible = false;

  const dispatchEvent = createEventDispatcher();

  let isSavingSettings = false;
  let currentSettings = get(settings);

  let search = "";
  let searchBoxRef;

  $: {
    if (searchBoxRef && visible) {
      searchBoxRef.focus();
    }
  }

  let changedSettings = [];

  const settingToggled = ({ detail }) => {
    changedSettings.push(detail);
  };

  const saveSettings = () => {
    isSavingSettings = true;
    $settings = currentSettings;
    isSavingSettings = false;
    dispatchEvent("settings-changed", changedSettings);
    closeSettingsManager();
  };

  const importSettings = () => ipcRenderer.send("import-settings");
  const exportSettings = () => ipcRenderer.send("export-settings", $settings);

  ipcRenderer.on("import-settings", (e, imported) => {
    if (imported.settings) {
      $settings = migrateSettings(imported.settings);
      currentSettings = get(settings);
    } else {
      $settings = imported;
      currentSettings = get(settings);
    }
  });

  const closeSettingsManager = () => {
    changedSettings = [];
    dispatchEvent("close-settings-manager");
  };

  onMount(() => {
    dispatchEvent(
      "settings-changed",
      Object.keys($settings).map((id) => {
        return { id, value: $settings[id].value };
      })
    );
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSettingsManager();
    }
  });
</script>

{#if visible}
  <div class="modal-container" transition:fade={{ duration: 100 }}>
    <div class="modal">
      <div class="header">
        <div class="title">Settings</div>
        <button class="close" on:click={() => closeSettingsManager()}>
          <Close />
        </button>
      </div>
      <div class="search-box">
        <input
          type="text"
          placeholder="Search..."
          bind:value={search}
          bind:this={searchBoxRef}
        />
      </div>
      <div class="settings">
        {#each Object.keys(currentSettings)
          .map((key) => {
            return { id: key, ...currentSettings[key] };
          })
          .filter((setting) => setting.name
                .toLowerCase()
                .includes(search) || setting.description
                .toLowerCase()
                .includes(search)) as setting}
          <div class="setting">
            <div class="info">
              <label class="name" for={setting.id}>{setting.name}</label>
              <div class="description">{setting.description}</div>
            </div>
            {#if typeof setting.value === "boolean"}
              <Toggle
                id={setting.id}
                bind:value={currentSettings[setting.id].value}
                on:toggle={settingToggled}
              />
            {:else if setting.options}
              <select
                id={setting.id}
                name={setting.id}
                bind:value={currentSettings[setting.id].value}
              >
                {#each setting.options as option}
                  <option value={option}>{option}</option>
                {/each}
              </select>
            {:else}
              <input
                type="text"
                id={setting.id}
                bind:value={currentSettings[setting.id].value}
              />
            {/if}
          </div>
        {/each}
      </div>
      <div class="controls">
        <button on:click={saveSettings} class:spinning={isSavingSettings}>
          {#if isSavingSettings}
            <Spinner />
          {:else}
            Save
          {/if}
        </button>
        <button
          title="Import Settings"
          class="outlined"
          on:click={importSettings}
        >
          <Import />
        </button>
        <button
          title="Export Settings"
          class="outlined"
          on:click={exportSettings}
        >
          <Export />
        </button>
      </div>
    </div>
    <div class="overlay" on:click={() => closeSettingsManager()} />
  </div>
{/if}

<style lang="scss">
  .modal-container {
    z-index: 3;
  }
  .modal {
    width: max(385px, 40vw);
    height: max(400px, 60vh);
  }
  .header {
    margin-bottom: 0.5rem;
  }
  input {
    width: 100%;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 400;
    padding: 0.4rem 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: transparent;
    color: #fff;
  }
  .search-box {
    margin-bottom: 0.5rem;
  }
  .settings {
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    margin-bottom: 0.75rem;
  }
  .settings::-webkit-scrollbar {
    width: 5px;
  }
  .settings::-webkit-scrollbar-thumb {
    background: #36475d;
  }
  .setting {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0.1rem 0.45rem 0 0rem;
    width: 100%;
    margin-bottom: 1rem;

    input[type="text"] {
      width: 50%;
      margin-left: 2rem;
    }
  }
  .info {
    width: max(200px, 50%);
  }
  .name {
    display: block;
    font-size: 1.25rem;
    font-weight: 550;
    margin-bottom: 0.35rem;
  }
  .description {
    font-size: 0.9rem;
    font-weight: 300;
  }
  .controls {
    display: flex;
  }
  .controls > * {
    margin-right: 0.5rem;
  }
</style>
