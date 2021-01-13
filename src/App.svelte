<script lang="ts">
	import type { TabType } from "./types";
	import TabBar from "./components/TabBar.svelte";
	import TabConfigModal from "./components/TabConfigModal.svelte";
	import TabContent from "./components/TabContent.svelte";
	import { tabs, themes } from "./store";
	const Store = require("electron-store");
	const { v4: uuid } = require("uuid");

	let defaultTabSettings = {
		id: uuid(),
		name: "",
		active: false,
		config: {
			theme: "default",
			notifications: true,
			sound: true,
			utilityBar: false,
			color: "#2A3440",
			spellChecker: false,
		},
	};

	let tabConfigModalVisible = false;
	let tabSettings = defaultTabSettings;

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

	tabs.set(
		tabStore.get("tabs").map((tab) => {
			// Migrate v3 tabs to v4
			if (!tab.config) {
				return {
					id: tab.id,
					name: tab.name,
					config: {
						theme: tab.theme,
						notifications: tab.notifications,
						sound: tab.sound,
						utilityBar: tab.utility_bar,
						color: tab.tab_color,
						spellChecker: tab.spellcheck,
					},
				};
			} else {
				return tab;
			}
		})
	);
	tabs.subscribe((tabs) => tabStore.set("tabs", tabs));

	themes.set(themeStore.get("themes"));
	themes.subscribe((themes) => themeStore.set("themes", themes));

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

<main>
	<div class="container">
		<TabBar
			on:add-tab={() => {
				tabConfigModalVisible = true;
				tabSettings = defaultTabSettings;
			}}
			on:edit-tab={(e) => {
				tabSettings = e.detail.tabToEdit;
				tabConfigModalVisible = true;
			}} />
		<TabContent />
		<TabConfigModal
			visible={tabConfigModalVisible}
			bind:tabSettings
			on:close-tab-config-modal={() => {
				tabConfigModalVisible = false;
				tabSettings = defaultTabSettings;
			}} />
	</div>
</main>
