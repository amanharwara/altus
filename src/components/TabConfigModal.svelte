<script lang="ts">
  import type { TabType, ThemeType } from "../types";
  import Toggle from "./common/Toggle.svelte";
  import { tabs, themes } from "../store";
  import Select from "svelte-select";
  import { createEventDispatcher } from "svelte";
  import Undo from "./svg/Undo.svelte";
  import Add from "./svg/Add.svelte";
  import Check from "./svg/Check.svelte";
  import ColorPicker from "./common/ColorPicker.svelte";
  import Modal from "./common/Modal.svelte";
  const { ipcRenderer } = require("electron");

  export let visible = false;
  export let tabSettings: TabType;

  let tabAlreadyExists = false;

  $: tabAlreadyExists = $tabs.find((tab) => tab.id === tabSettings.id);

  const dispatchEvent = createEventDispatcher();
  const closeModal = () => {
    if ($tabs.length > 0) {
      dispatchEvent("close-modal");
    }
  };
  const removeErrorClass = (e) => e.target.classList.remove("error");

  let themeSelectItems;

  $: {
    themeSelectItems = $themes.map((theme: ThemeType) => {
      return {
        value: theme.id,
        label: theme.name,
      };
    });
  }

  const submit = () => {
    let tab = tabSettings;

    if (tab.name.length === 0) {
      document.getElementById("tab-name").classList.add("error");
      return;
    }

    if (tabAlreadyExists) {
      let tabIndex = $tabs.findIndex((tab) => tab.id === tabSettings.id);
      $tabs[tabIndex] = {
        ...tab,
        active: $tabs[tabIndex].active,
      };
    } else {
      $tabs = [
        ...$tabs.map((tab) => {
          return { ...tab, active: false };
        }),
        tab,
      ];
    }

    closeModal();
  };

  const openTabDevTools = () => {
    (document as any)
      .getElementById(`webview-${tabSettings.id}`)
      .openDevTools();
  };

  const clearTabCache = () => {
    ipcRenderer.send("clear-cache", tabSettings.id);
  };
</script>

<Modal
  modalTitle={`${tabAlreadyExists ? "Edit" : "Add"} Tab`}
  {visible}
  showCloseButton={$tabs.length > 0}
  {closeModal}
>
  <div class="config">
    <div class="option column">
      <label for="tab-name">Name:</label>
      <input
        type="text"
        id="tab-name"
        bind:value={tabSettings.name}
        on:focus={removeErrorClass}
      />
      <div class="error-message">Name cannot be empty.</div>
    </div>
    <div class="option column selector">
      <label for="tab-theme">Theme:</label>
      <Select
        items={themeSelectItems}
        value={themeSelectItems.find(
          (theme) => theme.value === tabSettings.config.theme
        )}
        showIndicator={true}
        isClearable={false}
        on:select={(e) => {
          tabSettings.config.theme = e.detail.value;
        }}
      />
    </div>
    <div class="option">
      <label for="tab-notif">Notifications:</label>
      <Toggle id="tab-notif" bind:value={tabSettings.config.notifications} />
    </div>
    <div class="option">
      <label for="tab-sound">Sound:</label>
      <Toggle id="tab-sound" bind:value={tabSettings.config.sound} />
    </div>
    <div class="option">
      <label for="tab-utilityBar">Utility Bar:</label>
      <Toggle id="tab-utilityBar" bind:value={tabSettings.config.utilityBar} />
    </div>
    <div class="option">
      <label for="tab-color">Color:</label>
      <div class="color-input">
        <ColorPicker bind:color={tabSettings.config.color} />
        <button
          class="reset-color"
          on:click={() => (tabSettings.config.color = "#2A3440")}
        >
          <Undo />
        </button>
      </div>
    </div>
    <div class="option">
      <label for="tab-spellchecker">Spellchecker:</label>
      <Toggle
        id="tab-spellchecker"
        bind:value={tabSettings.config.spellChecker}
      />
    </div>
  </div>
  <div class={`controls ${tabAlreadyExists ? "vertical-controls" : ""}`}>
    <button class="submit" on:click={submit}>
      <div class="icon">
        {#if tabAlreadyExists}
          <Check />
        {:else}
          <Add />
        {/if}
      </div>
      <div class="label">
        {#if tabAlreadyExists}Save{:else}Add{/if}
      </div>
    </button>
    {#if tabAlreadyExists}
      <div>
        <button class="open-devtools" on:click={openTabDevTools}
          >Open DevTools</button
        >
        <button on:click={clearTabCache}>Clear Cache</button>
      </div>
    {/if}
  </div>
</Modal>

<style lang="scss">
  .config {
    margin-bottom: 1.25rem;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.1rem;
    position: relative;
  }

  .option:not(:last-child) {
    margin-bottom: 0.65rem;
  }

  input {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    padding: 0.4rem 0.5rem;
    border: 0;
  }

  :global(.error) {
    outline: 2px solid #d64b4b;
  }

  :global(.error) + .error-message {
    display: block;
  }

  .error-message {
    position: absolute;
    top: 100%;
    left: -2px;
    width: calc(100% + 4px);
    background: #d64b4b;
    color: #fff;
    z-index: 2;
    font-size: 0.85rem;
    padding: 0.15rem;
    display: none;
  }

  .color-input {
    display: flex;
    align-items: center;
  }

  .color-input > :last-child {
    margin-left: 0.5rem;
  }

  .reset-color {
    width: 1.65rem;
    height: 1.65rem;
    padding: 0.2rem !important;
    background: #2c333b;
    fill: #fff;
    border: 0;
  }

  .column {
    flex-flow: column;
    align-items: stretch;
  }

  .column label {
    margin-bottom: 0.4rem;
    color: #fff;
  }

  .selector {
    --borderRadius: 0;
    --listBorderRadius: 0;
    --itemFirstBorderRadius: 0;
    --inputColor: #000;
    --inputPadding: 0.35rem 0.5rem;
    --inputFontSize: 1rem;
    --itemColor: #000;
    --itemPadding: 0 0.5rem;
    --itemFontSize: 0.95rem;
    --height: calc(1rem + 0.55rem * 2);
    --indicatorTop: calc(var(--height) - 88%);
    --indicatorRight: 0.5rem;
    color: #000;
    margin-bottom: 0.75rem !important;
  }

  .selector :global(.selectContainer) {
    --padding: 0 0.5rem !important;
  }

  .selector :global(.selectedItem),
  .selector :global(.item) {
    font-size: 1rem;
  }

  .selector :global(input) {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  .selector :global(input):hover {
    cursor: text;
  }

  .selector :global(input):focus + :global(.selectedItem) {
    display: none;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .submit {
    display: flex;
    align-items: center;
    border: 0;
    padding: 0.6rem 1.25rem 0.6rem 1rem;
    font-size: 1.05rem;
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-weight: 500;
    background: #2268c4;
    color: #fff;
    fill: #fff;
    transition: background 0.15s;
  }

  .submit:hover {
    background: #1c5aaa;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
  }

  .icon :global(svg path) {
    width: 100%;
    height: 100%;
  }

  .vertical-controls {
    flex-flow: column;
    align-items: flex-start;

    & > :first-child {
      margin-bottom: 0.5rem;
    }
  }
</style>
