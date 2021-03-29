<script lang="ts">
  import type { TabType } from "../types";
  import Close from "./svg/Close.svelte";
  import { createEventDispatcher } from "svelte";
  import Cog from "./svg/Cog.svelte";
  export let tab: TabType;

  const dispatch = createEventDispatcher();

  const activateTab = () => {
    dispatch("activateTab", {
      id: tab.id,
    });
  };

  const removeTab = () => {
    dispatch("removeTab", {
      id: tab.id,
    });
  };

  const editTab = () => {
    dispatch("editTab", {
      id: tab.id,
    });
  };
</script>

<div
  class="tab"
  class:active={tab.active}
  on:click={activateTab}
  style={`background: ${tab.config.color};`}
  id={tab.id}
>
  {#if tab.messageCount}
    <span class="badge" data-count={tab.messageCount} />
  {/if}
  <div class="name">{tab.name}</div>
  <div class="controls">
    <div class="edit" on:click={editTab} style="stroke: #fff">
      <Cog />
    </div>
    <div class="close" on:click={removeTab}>
      <Close />
    </div>
  </div>
</div>

<style lang="scss">
  .tab {
    display: flex;
    background: #2a3440;
    color: #fff;
    fill: #fff;
    font-size: 1rem;
    font-weight: 300;
    padding: 0.5rem 0.95rem;
    align-items: center;
    justify-content: center;
    filter: brightness(0.75);
    cursor: pointer;
    user-select: none;
    transition: filter 0.15s;
    flex-shrink: 0;
  }
  .tab:not(.active):hover {
    filter: brightness(0.85);
  }
  .active {
    font-weight: 450;
    filter: brightness(1);
  }
  .name {
    margin-right: 0.75rem;
  }
  .controls {
    display: flex;
  }
  .controls > * {
    width: 1.25rem;
    height: 1.25rem;

    :global(svg) {
      width: 100%;
      height: 100%;
    }
  }
  .controls > :first-child {
    margin-right: 0.45rem;
  }
  .badge {
    background: #c70e0e;
    border-radius: 50%;
    font-size: 0.75rem;
    position: relative;
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 0.5rem;
  }
  .badge::after {
    content: attr(data-count);
    position: absolute;
    top: 45%;
    left: 45%;
    transform: translate(-50%, -50%);
  }
</style>
