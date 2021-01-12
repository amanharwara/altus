<script lang="ts">
  import type { TabType, ThemeType } from "../types";
  import Toggle from "./common/Toggle.svelte";
  import Close from "./svg/close.svelte";
  import { tabs, themes } from "../store";
  import Select from "svelte-select";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import Undo from "./svg/Undo.svelte";
  const { v4: uuid } = require("uuid");

  export let visible = false;
  export let tabToEdit: TabType;

  const dispatchEvent = createEventDispatcher();
  const closeTabConfigModal = () => dispatchEvent("close-tab-config-modal");

  let id = uuid();
  let name = "";
  let theme = "default";
  let notifications = true;
  let sound = true;
  let utilityBar = false;
  let color = "#2A3440";
  let spellChecker = false;

  if (tabToEdit) {
    id = tabToEdit.id;
    name = tabToEdit.name;
    theme = tabToEdit.config.theme;
    notifications = tabToEdit.config.notifications;
    sound = tabToEdit.config.sound;
    utilityBar = tabToEdit.config.utilityBar;
    color = tabToEdit.config.color;
    spellChecker = tabToEdit.config.spellChecker;
  }

  let themeSelectItems = [
    ...$themes.map((theme: ThemeType) => {
      return {
        value: theme.name.toLowerCase().replace(/\W/, ""),
        label: theme.name,
      };
    }),
  ];

  const submit = () => {
    if (tabToEdit) {
    } else {
      $tabs = [
        ...$tabs,
        {
          id,
          name,
          config: {
            theme,
            notifications,
            sound,
            utilityBar,
            color,
            spellChecker,
          },
        },
      ];
    }
    closeTabConfigModal();
  };
</script>

<style>
  .modal-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .modal {
    display: flex;
    flex-flow: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #242a31;
    color: #fff;
    z-index: 1;
    padding: 1.25rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .title {
    font-weight: 500;
    font-size: 1.5rem;
  }

  .close {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0.15rem 0.2rem;
    fill: #fff;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .close:hover {
    background: #2c333b;
  }

  .config {
    margin-bottom: 1rem;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.1rem;
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

  .color-input {
    display: flex;
    align-items: center;
  }

  input[type="color"] {
    appearance: none;
    border: none;
    padding: 0.05rem 0.1rem;
    margin-right: 0.65rem;
    cursor: pointer;
  }

  input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  input[type="color"]::-webkit-color-swatch {
    border: none;
  }

  .reset-color {
    width: 1.65rem;
    height: 1.65rem;
    padding: 0.2rem;
    background: #2c333b;
    fill: #fff;
    border: 0;
    cursor: pointer;
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

  .selector :global(.selectedItem, .item) {
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

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.65);
    z-index: 0;
  }
</style>

{#if visible}
  <div class="modal-container" transition:fade={{ duration: 100 }}>
    <div class="modal">
      <div class="header">
        <div class="title">
          {#if tabToEdit}Edit{:else}Add{/if}
          Tab
        </div>
        <button class="close" on:click={() => closeTabConfigModal()}>
          <Close />
        </button>
      </div>
      <div class="config">
        <div class="option column">
          <label for="tab-name">Name:</label>
          <input type="text" id="tab-name" bind:value={name} />
        </div>
        <div class="option column selector">
          <label for="tab-theme">Theme:</label>
          <Select
            bind:items={themeSelectItems}
            bind:selectedValue={theme}
            showIndicator={true}
            isClearable={false} />
        </div>
        <div class="option">
          <label for="tab-notif">Notifications:</label>
          <Toggle id="tab-notif" bind:value={notifications} />
        </div>
        <div class="option">
          <label for="tab-sound">Sound:</label>
          <Toggle id="tab-sound" bind:value={sound} />
        </div>
        <div class="option">
          <label for="tab-utilityBar">Utility Bar:</label>
          <Toggle id="tab-utilityBar" bind:value={utilityBar} />
        </div>
        <div class="option">
          <label for="tab-color">Color:</label>
          <div class="color-input">
            <input type="color" id="tab-color" bind:value={color} />
            <button class="reset-color" on:click={() => (color = '#2A3440')}>
              <Undo />
            </button>
          </div>
        </div>
        <div class="option">
          <label for="tab-spellchecker">Spellchecker:</label>
          <Toggle id="tab-spellchecker" bind:value={spellChecker} />
        </div>
      </div>
      <div class="controls">
        <button on:click={submit}>
          {#if tabToEdit}Edit{:else}Add{/if}
        </button>
      </div>
    </div>
    <div class="overlay" on:click={() => closeTabConfigModal()} />
  </div>
{/if}
