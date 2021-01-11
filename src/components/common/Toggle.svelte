<script lang="ts">
  export let id = "toggle";
  export let value = false;
</script>

<style>
</style>

<div class="toggle">
  <input type="checkbox" {id} checked={value} />
  <div class="toggle-bg" />
</div>
