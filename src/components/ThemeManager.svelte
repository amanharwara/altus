<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import Close from "./svg/close.svelte";
  import { paths, themes } from "../store";
  import Download from "./svg/Download.svelte";
  import Spinner from "./svg/Spinner.svelte";
  import { compileTheme } from "../util/theme";
  export let visible = false;

  const dispatchEvent = createEventDispatcher();
  const closeThemeManager = () => {
    dispatchEvent("close-theme-manager");
  };

  let active = "themes-list";
  let isEditingTheme = false;
  let isDownloadingDarkTheme = false;
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
      <div class="tabs">
        <button
          class="theme-list-tab"
          class:active={active === "themes-list"}
          on:click={() => (active = "themes-list")}> Themes </button>
        <button
          class="theme-creator-tab"
          class:active={active === "theme-creator"}
          on:click={() => (active = "theme-creator")}>
          {#if isEditingTheme}
            Edit
          {:else}
            Add
          {/if} Theme
        </button>
      </div>
      <div class="content">
        {#if active === "themes-list"}
          <div class="themes">
            {#each $themes as theme}
              <div class="theme">
                <div class="name">{theme.name}</div>
                {#if theme.colors}
                  <div class="controls">
                    <button
                      class="delete"
                      on:click={() => {
                        $themes = $themes.filter((t) => t.name !== theme.name);
                      }}><Close /></button
                    >
                  </div>
                {/if}
              </div>
            {/each}
            {#if !$themes.find((theme) => theme.name === "Dark Plus")}
              <div class="theme">
                <div class="name">Dark Plus</div>
                <div class="controls">
                  <button
                    class="download"
                    class:spinning={isDownloadingDarkTheme}
                    on:click={async () => {
                      isDownloadingDarkTheme = true;
                      let darkTheme = await compileTheme(null, $paths.userData);
                      if (darkTheme) {
                        isDownloadingDarkTheme = false;
                        $themes = [
                          ...$themes,
                          {
                            name: "Dark Plus",
                            css: darkTheme,
                            colors: {
                              bg: "#1f232a",
                              fg: "#eee",
                              ac: "#7289da",
                            },
                          },
                        ];
                      }
                    }}>
                    {#if isDownloadingDarkTheme}
                      <Spinner />
                    {:else}
                      <Download />
                    {/if}
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="theme-creator">
            <div class="options">
              <div class="opt">
                <label for="theme-preset">Preset:</label>
              </div>
              <div class="opt">
                <label for="theme-name">Name:</label>
                <input type="text" id="theme-name" />
              </div>
              <div class="opt">
                <label for="theme-bg">Background Color:</label>
                <input type="text" id="theme-bg" />
              </div>
              <div class="opt">
                <label for="theme-fg">Foreground Color:</label>
                <input type="text" id="theme-fg" />
              </div>
              <div class="opt">
                <label for="theme-ac">Accent Color:</label>
                <input type="text" id="theme-ac" />
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="main-controls">
        {#if active === "themes-list"}
          <button>Update Themes</button>
        {:else}
          <button>
            {#if isEditingTheme}
              Edit
            {:else}
              Add
            {/if} Theme
          </button>
        {/if}
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
    width: max(350px, 30vw);
  }
  .tabs {
    display: flex;
    border-bottom: 2px solid #303b49;
  }
  button:not(.close) {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    border: 0;
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
    color: #fff;
    background: #303b49;
    -webkit-user-select: none;
  }
  button:hover {
    background: #2c3542;
  }
  .tabs :not(.active) {
    background: transparent;
  }
  .tabs .active {
    background: #303b49;
  }
  .themes {
    display: flex;
    flex-flow: column;
    padding: 0.75rem;
  }
  .theme {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0;
    font-size: 1.05rem;
  }
  .theme:not(:last-child) {
    border-bottom: 1px solid rgba(44, 53, 66, 0.85);
  }
  .theme .controls button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.55rem;
    height: 1.55rem;
    padding: 0.3rem;
    background: #303b49;
    fill: #fff;
    border: 0;
  }
  .theme .controls button:hover {
    background: #2c3542;
  }
  .theme .controls button :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }
  .spinning :global(svg) {
    animation: infinite spin 0.5s;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
