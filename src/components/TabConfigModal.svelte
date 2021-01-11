<script lang="ts">
  import type { TabType } from "../types";
  import Toggle from "./common/Toggle.svelte";
  import Close from "./svg/close.svelte";

  export let visible = false;
  export let tabToEdit: TabType;

  let name = tabToEdit ? tabToEdit.name : "";
  let notifications = tabToEdit ? tabToEdit.config.notifications : true;
  let sound = tabToEdit ? tabToEdit.config.sound : true;
  let utilityBar = tabToEdit ? tabToEdit.config.utilityBar : false;
  let color = tabToEdit ? tabToEdit.config.color : "#2A3440";
  let spellChecker = tabToEdit ? tabToEdit.config.spellChecker : false;
</script>

{#if visible}
  <div class="modal">
    <div class="header">
      <div class="title">
        {#if tabToEdit}Edit{:else}Add{/if}
        Tab
      </div>
      <div class="close" on:click={() => (visible = !visible)}>
        <Close />
      </div>
    </div>
    <div class="config">
      <div class="option">
        <label for="tab-name">Name:</label>
        <input type="text" id="tab-name" bind:value={name} />
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
        <input type="color" id="tab-color" bind:value={color} />
      </div>
      <div class="option">
        <label for="tab-spellchecker">Spellchecker:</label>
        <Toggle id="tab-spellchecker" bind:value={spellChecker} />
      </div>
    </div>
    <div class="controls" />
  </div>
{/if}
