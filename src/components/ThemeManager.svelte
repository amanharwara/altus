<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import Close from "./svg/close.svelte";
  import { paths, themes } from "../store";
  import Download from "./svg/Download.svelte";
  import Spinner from "./svg/Spinner.svelte";
  import { compileTheme, themePresets } from "../util/theme";
  import ColorPicker from "./common/ColorPicker.svelte";
  import Edit from "./svg/Edit.svelte";
  const { v4: uuid } = require("uuid");
  export let visible = false;

  const dispatchEvent = createEventDispatcher();
  const closeThemeManager = () => {
    dispatchEvent("close-theme-manager");
  };

  let active = "themes-list";
  let isEditingTheme = false;
  let isDownloadingDarkTheme = false;
  let isSavingTheme = false;
  let isUpdatingThemes = false;

  let newTheme = {
    name: "",
    id: null,
    css: "",
    colors: { ...themePresets["dark"] },
  };

  const selectThemePreset = (e) => {
    let value = e.target.value;
    newTheme = {
      ...newTheme,
      colors: { ...themePresets[value] },
    };
  };

  const submitTheme = async () => {
    isSavingTheme = true;
    let theme = newTheme;
    if (newTheme.id) {
      let themeIndex = $themes.findIndex((theme) => theme.id === newTheme.id);
      let { colors } = $themes[themeIndex];
      if (
        colors.bg === newTheme.colors.bg &&
        colors.fg === newTheme.colors.fg &&
        colors.ac === newTheme.colors.ac
      ) {
        $themes[themeIndex] = newTheme;
      } else {
        let themeCSS = await compileTheme(
          { ...newTheme.colors },
          $paths.userData
        );
        if (themeCSS) {
          theme.css = themeCSS;
        }
        $themes[themeIndex] = theme;
      }
    } else {
      let id = uuid();
      theme.id = id;
      let themeNames = $themes.map((theme) => theme.name);
      if (themeNames.includes(theme.name)) {
        theme.name = `${theme.name} - 1`;
      }
      let themeCSS = await compileTheme(
        { ...newTheme.colors },
        $paths.userData
      );
      if (themeCSS) {
        theme.css = themeCSS;
      }
      $themes = [...$themes, theme];
    }
    active = "themes-list";
    newTheme = {
      name: "",
      id: null,
      css: "",
      colors: { ...themePresets["dark"] },
    };
    isEditingTheme = false;
    isSavingTheme = false;
  };

  const cancelEditingTheme = () => {
    isEditingTheme = false;
    newTheme = {
      name: "",
      id: null,
      css: "",
      colors: { ...themePresets["dark"] },
    };
    active = "themes-list";
  };

  const updateThemes = async () => {
    isUpdatingThemes = true;

    for (let theme of $themes) {
      if (theme.css.length > 0) {
        let updatedThemeCSS = await compileTheme(theme.colors, $paths.userData);
        let themeIndex = $themes.findIndex((t) => t.id === theme.id);
        $themes[themeIndex] = {
          ...$themes[themeIndex],
          css: updatedThemeCSS,
        };
      }
    }

    isUpdatingThemes = false;
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
                    {#if theme.id !== "dark-plus"}
                      <button
                        class="edit"
                        on:click={() => {
                          newTheme = theme;
                          active = "theme-creator";
                          isEditingTheme = true;
                        }}><Edit /></button
                      >
                    {/if}
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
                            id: "dark-plus",
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
                <select id="theme-preset" on:input={selectThemePreset}>
                  <option value="dark">Dark</option>
                  <option value="darkMint">Dark Mint</option>
                  <option value="purplish">Purple-ish</option>
                </select>
              </div>
              <div class="opt">
                <label for="theme-name">Name:</label>
                <input type="text" id="theme-name" bind:value={newTheme.name} />
              </div>
              <div class="opt">
                <label for="theme-bg">Background Color:</label>
                <div class="colorInput">
                  <input
                    type="text"
                    id="theme-bg"
                    bind:value={newTheme.colors.bg}
                  />
                  <ColorPicker bind:color={newTheme.colors.bg} />
                </div>
              </div>
              <div class="opt">
                <label for="theme-fg">Foreground Color:</label>
                <div class="colorInput">
                  <input
                    type="text"
                    id="theme-fg"
                    bind:value={newTheme.colors.fg}
                  />
                  <ColorPicker bind:color={newTheme.colors.fg} />
                </div>
              </div>
              <div class="opt">
                <label for="theme-ac">Accent Color:</label>
                <div class="colorInput">
                  <input
                    type="text"
                    id="theme-ac"
                    bind:value={newTheme.colors.ac}
                  />
                  <ColorPicker bind:color={newTheme.colors.ac} />
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="main-controls">
        {#if active === "themes-list"}
          <button on:click={updateThemes} class:spinning={isUpdatingThemes}>
            {#if isUpdatingThemes}
              <Spinner />
            {:else}
              Update Themes
            {/if}
          </button>
        {:else}
          <button on:click={submitTheme} class:spinning={isSavingTheme}>
            {#if isSavingTheme}
              <Spinner />
            {:else}
              {#if isEditingTheme}
                Edit
              {:else}
                Add
              {/if} Theme
            {/if}
          </button>
          {#if isEditingTheme}
            <button on:click={cancelEditingTheme}>Cancel</button>
          {/if}
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
    width: max(375px, 30vw);
    height: max(400px, 60vh);
  }
  .tabs {
    display: flex;
    border-bottom: 2px solid #303b49;
  }
  .tabs :not(.active) {
    background: transparent;
  }
  .tabs .active {
    background: #303b49;
  }
  .content {
    flex-grow: 1;
    overflow-y: auto;
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
  .theme .controls {
    display: flex;
  }
  .theme .controls :not(:last-child) {
    margin-right: 0.5rem;
  }
  .theme .controls button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.55rem;
    height: 1.55rem;
    padding: 0.3rem;
    background: #303b49;
    border: 0;
  }
  .theme .controls button:hover {
    background: #2c3542;
  }
  .options {
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
</style>
