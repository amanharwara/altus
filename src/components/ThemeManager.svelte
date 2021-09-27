<script lang="ts">
  import Close from "./svg/Close.svelte";
  import { paths, themes } from "../store";
  import Download from "./svg/Download.svelte";
  import Spinner from "./svg/Spinner.svelte";
  import { compileTheme, themePresets } from "../util/theme";
  import Edit from "./svg/Edit.svelte";
  import ThemeCreator from "./ThemeCreator.svelte";
  import type { ThemeType } from "../types";
  import Modal from "./common/Modal.svelte";
  const { v4: uuid } = require("uuid");
  export let visible = false;

  let active = "themes-list";
  let isEditingTheme = false;
  let isDownloadingDarkTheme = false;
  let isSavingTheme = false;
  let isUpdatingThemes = false;

  let newTheme: ThemeType = {
    name: "",
    id: null,
    css: "",
    colors: { ...themePresets["dark"] },
  };

  const selectThemePreset = ({ detail: e }) => {
    let value = e.target.value;
    if (value !== "customCSS") {
      newTheme = {
        ...newTheme,
        colors: { ...themePresets[value] },
        preset: value,
      };
    } else {
      newTheme = {
        ...newTheme,
        customCSS: true,
        colors: null,
        preset: value,
      };
    }
  };

  const submitTheme = async () => {
    isSavingTheme = true;
    let theme = newTheme;
    if (newTheme.id) {
      let themeIndex = $themes.findIndex((theme) => theme.id === newTheme.id);
      let theme = $themes[themeIndex];
      if (!theme.customCSS) {
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
      }
    } else {
      let id = uuid();
      theme.id = id;
      let themeNames = $themes.map((theme) => theme.name);
      if (themeNames.includes(theme.name)) {
        theme.name = `${theme.name} - 1`;
      }
      if (!newTheme.customCSS) {
        let themeCSS = await compileTheme(
          { ...newTheme.colors },
          $paths.userData
        );
        if (themeCSS) {
          theme.css = themeCSS;
        }
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

<Modal
  modalTitle="Theme Manager"
  {visible}
  width="max(375px, 30vw)"
  height="max(400px, 60vh)"
>
  <div class="tabs">
    <button
      class="theme-list-tab"
      class:active={active === "themes-list"}
      on:click={() => (active = "themes-list")}
    >
      Themes
    </button>
    <button
      class="theme-creator-tab"
      class:active={active === "theme-creator"}
      on:click={() => (active = "theme-creator")}
    >
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
            {#if theme.colors || theme.customCSS}
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
                }}
              >
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
      <ThemeCreator on:select-preset={selectThemePreset} bind:newTheme />
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
</Modal>

<style>
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
</style>
