<script lang="ts">
  export let color = "#fff";
</script>

<div class="colorPicker">
  <div class="preview" style={`background: ${color}`} />
  <input type="color" bind:value={color} />
</div>

<style>
  .colorPicker {
    width: 1.65rem;
    height: 1.65rem;
    position: relative;
  }
  .colorPicker:focus-within {
    outline: 2px solid #2067d1;
  }
  .preview {
    width: 100%;
    height: 100%;
    border: 1px solid #fff;
  }
  input {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
  }
</style>
