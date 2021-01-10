<script lang="ts">
  import { tabs } from "../store/store";
</script>

<style>
</style>

<div class="tab-content">
  {#if $tabs.length > 0}
    {#each $tabs as tab}
      <div class="content" />
    {/each}
  {/if}
</div>
