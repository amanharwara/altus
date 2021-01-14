<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { fade } from "svelte/transition";
  import Close from "./svg/close.svelte";
  export let visible = false;

  const dispatchEvent = createEventDispatcher();
  const closeThemeManager = () => {
    dispatchEvent("close-theme-manager");
  };
</script>

{#if visible}
  <div class="modal-container" transition:fade={{ duration: 100 }}>
    <div class="modal">
      <div class="header">
        <div class="title">Theme Manager</div>
        <button class="close" on:click={() => closeThemeManager()}>
          <Close />
        </button>
      </div>
    </div>
    <div class="overlay" on:click={() => closeThemeManager()} />
  </div>
{/if}

<style>
  .modal-container {
    z-index: 2;
  }
  .modal {
    width: max(300px, 30vw);
  }
</style>
