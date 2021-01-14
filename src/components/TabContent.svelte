<script lang="ts">
  import { tabs } from "../store";
  import WebView from "./WebView.svelte";
</script>

<div class="tab-content">
  {#if $tabs.length > 0}
    {#each $tabs as tab}
      <div class="content" class:active={tab.active}>
        <WebView partition={`persist:${tab.id}`} {tab} />
      </div>
    {/each}
  {/if}
</div>

<style>
  .tab-content {
    flex-grow: 1;
  }
  .content {
    height: 100%;
  }
  .content:not(.active) {
    display: none;
  }
  .content :global(*) {
    height: 100%;
  }
</style>
