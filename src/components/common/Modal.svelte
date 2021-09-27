<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { currentModal } from "../../store";
  import Close from "../svg/Close.svelte";
  const dispatchEvent = createEventDispatcher();

  export let modalTitle = "Modal";
  export let visible = false;
  export let width = "";
  export let height = "";
  export let showCloseButton = true;
  export let closeModal = () => {
    dispatchEvent("close-modal");
    currentModal.set(null);
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      currentModal.set(null);
    }
  });
</script>

{#if visible}
  <div class="modal-container" transition:fade={{ duration: 100 }}>
    <div class="modal" style={`width: ${width}; height: ${height}`}>
      <div class="header">
        <div class="title">{modalTitle}</div>
        {#if showCloseButton}
          <button class="close" on:click={() => closeModal()}>
            <Close />
          </button>
        {/if}
      </div>
      <slot />
    </div>
  </div>
  <div class="overlay" on:click={() => closeModal()} />
{/if}
