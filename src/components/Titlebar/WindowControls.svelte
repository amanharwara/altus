<script lang="ts">
  export let maximized;

  import Minimize from "../svg/Titlebar/Minimize.svelte";
  import Maximize from "../svg/Titlebar/Maximize.svelte";
  import Restore from "../svg/Titlebar/Restore.svelte";
  import Close from "../svg/Close.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatchEvent = createEventDispatcher();
</script>

<div id="window-controls">
  <button
    type="button"
    class="window-button"
    id="min-button"
    on:click={() => dispatchEvent("minimize")}
  >
    <Minimize />
  </button>
  {#if maximized}
    <button
      type="button"
      class="window-button"
      id="restore-button"
      on:click={() => dispatchEvent("restore")}
    >
      <Restore />
    </button>
  {:else}
    <button
      type="button"
      class="window-button"
      id="max-button"
      on:click={() => dispatchEvent("maximize")}
    >
      <Maximize />
    </button>
  {/if}
  <button
    type="button"
    class="window-button"
    id="close-button"
    on:click={() => dispatchEvent("close")}
  >
    <Close />
  </button>
</div>

<style lang="scss">
  #window-controls {
    display: grid;
    grid-template-columns: repeat(3, 46px);
    height: 100%;
    -webkit-app-region: no-drag;
    margin-left: auto;
  }
  .window-button {
    grid-row: 1 / span 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    user-select: none;
    background: transparent;
    border: 0;

    &:focus {
      outline: none;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &:active {
      background: rgba(255, 255, 255, 0.2);
    }
  }
  #min-button {
    grid-column: 1;
  }
  #max-button,
  #restore-button {
    grid-column: 2;
  }
  #close-button {
    grid-column: 3;

    &:hover {
      background: #e81123 !important;
    }

    &:active {
      background: #f1707a !important;

      :global(svg) {
        filter: invert(1);
      }
    }
  }
</style>
