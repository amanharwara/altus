<script lang="ts">
  export let newTheme;

  import { createEventDispatcher } from "svelte";
  import ColorPicker from "./common/ColorPicker.svelte";

  const dispatchEvent = createEventDispatcher();

  let selectedPreset = "dark";

  const selectPreset = (e) => {
    selectedPreset = e.target.value;
    dispatchEvent("select-preset", e);
  };
</script>

<div class="theme-creator">
  <div class="options">
    <div class="opt">
      <label for="theme-preset">Preset:</label>
      <select id="theme-preset" on:input={selectPreset} value={newTheme.preset}>
        <option value="dark">Dark</option>
        <option value="darkMint">Dark Mint</option>
        <option value="purplish">Purple-ish</option>
        <option value="customCSS">Custom CSS</option>
      </select>
    </div>
    <div class="opt">
      <label for="theme-name">Name:</label>
      <input type="text" id="theme-name" bind:value={newTheme.name} />
    </div>
    {#if selectedPreset !== "customCSS" && newTheme.colors}
      <div class="opt">
        <label for="theme-bg">Background Color:</label>
        <div class="colorInput">
          <input type="text" id="theme-bg" bind:value={newTheme.colors.bg} />
          <ColorPicker bind:color={newTheme.colors.bg} />
        </div>
      </div>
      <div class="opt">
        <label for="theme-fg">Foreground Color:</label>
        <div class="colorInput">
          <input type="text" id="theme-fg" bind:value={newTheme.colors.fg} />
          <ColorPicker bind:color={newTheme.colors.fg} />
        </div>
      </div>
      <div class="opt">
        <label for="theme-ac">Accent Color:</label>
        <div class="colorInput">
          <input type="text" id="theme-ac" bind:value={newTheme.colors.ac} />
          <ColorPicker bind:color={newTheme.colors.ac} />
        </div>
      </div>
    {:else}
      <div class="css-input">
        <label for="css-textarea">CSS:</label>
        <textarea id="css-textarea" bind:value={newTheme.css} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .theme-creator,
  .options {
    height: 100%;
  }
  .options {
    display: flex;
    flex-flow: column;
    padding: 0.75rem;
  }
  .opt {
    padding: 0.3rem 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .opt input,
  .opt select {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 0.85rem;
    font-weight: 400;
    padding: 0.35rem 0.4rem;
    border: 0;
    width: 40%;
  }
  .colorInput {
    display: flex;
    align-items: center;
    width: 40%;
  }
  .colorInput > input {
    flex-grow: 1;
    margin-right: 0.5rem;
  }
  .css-input {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
    padding: 0.3rem 0;

    textarea {
      margin-top: 0.3rem;
      flex-grow: 1;
      padding: 0.2rem;
      font-family: monospace;
    }
  }
</style>
