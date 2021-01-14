<script lang="ts">
  import TabBar from "./components/TabBar.svelte";
  import TabConfigModal from "./components/TabConfigModal.svelte";
  import TabContent from "./components/TabContent.svelte";
  import ThemeManager from "./components/ThemeManager.svelte";
  import { tabs, themes } from "./store";
  import defaultTabSettings from "./util/defaultTabSettings";
  import migrateTab from "./util/migrateTab";
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
          css: "",
        },
        {
          name: "Dark",
          css: "",
        },
      ],
    },
  });

  tabs.set(tabStore.get("tabs").map(migrateTab));
  tabs.subscribe((tabs) => {
    tabStore.set("tabs", tabs);
    if (tabs.length === 0) {
      tabConfigModalVisible = true;
    }
  });

  themes.set(themeStore.get("themes"));
  themes.subscribe((themes) => themeStore.set("themes", themes));

  ipcRenderer.on("open-theme-manager", () => {
    themeManagerVisible = true;
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
