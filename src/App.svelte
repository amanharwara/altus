<script lang="ts">
  import TabBar from "./components/TabBar.svelte";
  import TabConfigModal from "./components/TabConfigModal.svelte";
  import TabContent from "./components/TabContent.svelte";
  import ThemeManager from "./components/ThemeManager.svelte";
  import { paths, tabs, themes } from "./store";
  import type { ThemeType } from "./types";
  import defaultTabSettings from "./util/defaultTabSettings";
  import migrateTab from "./util/migrateTab";
  import { migrateTheme } from "./util/theme";
  const Store = require("electron-store");
  const { ipcRenderer } = require("electron");

  let tabConfigModalVisible = false;
  let themeManagerVisible = false;

  let tabSettings = defaultTabSettings();

  let tabStore = new Store({
    name: "tabs",
    defaults: {
      tabs: [],
    },
  });

  let themeStore = new Store({
    name: "themes",
    defaults: {
      themes: [
        {
          name: "Default",
          id: "default",
          css: "",
        },
        {
          name: "Dark",
          id: "dark",
          css: "",
        },
      ],
    },
  });

  tabs.set(tabStore.get("tabs").map(migrateTab));
  tabs.subscribe((tabs) => {
    tabStore.set("tabs", tabs.map(migrateTab));
    if (tabs.length === 0) {
      tabConfigModalVisible = true;
    }
  });

  themes.set(themeStore.get("themes").map(migrateTheme));
  themes.subscribe((themes: ThemeType[]) => {
    themeStore.set("themes", themes.map(migrateTheme));
    let themeIDs = themes.map((theme) => theme.id);
    $tabs = $tabs.map((tab) => {
      if (!themeIDs.includes(tab.config.theme)) {
        return {
          ...tab,
          config: {
            ...tab.config,
            theme: "default",
          },
        };
      } else {
        return tab;
      }
    });
  });

  ipcRenderer.on("open-theme-manager", () => {
    themeManagerVisible = true;
  });

  ipcRenderer.on("userDataPath", (path) => {
    $paths = {
      ...$paths,
      userData: path,
    };
  });

  /* onMount(() => {
		if (!$themes.find((theme) => theme.name === "Dark Plus")) {
			window
				.fetch(
					"https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl"
				)
				.then((res) => res.text())
				.then((base_theme) => {})
				.catch((err) => console.error(err));
		}
	}); */
</script>

<main>
  <div class="container">
    <TabBar
      on:add-tab={() => {
        tabConfigModalVisible = true;
        tabSettings = defaultTabSettings();
      }}
      on:edit-tab={(e) => {
        tabSettings = e.detail.tabToEdit;
        tabConfigModalVisible = true;
      }}
    />
    <TabContent />
    <ThemeManager
      visible={themeManagerVisible}
      on:close-theme-manager={() => {
        themeManagerVisible = false;
      }}
    />
    <TabConfigModal
      visible={tabConfigModalVisible}
      {tabSettings}
      on:close-tab-config-modal={() => {
        tabConfigModalVisible = false;
        tabSettings = defaultTabSettings();
      }}
    />
  </div>
</main>

<style>
  main {
    height: 100%;
  }
  .container {
    display: flex;
    flex-flow: column;
    height: 100%;
    position: relative;
  }
</style>
