<script lang="ts">
	import { onMount } from "svelte";
	import TabBar from "./components/TabBar.svelte";
	import TabConfigModal from "./components/TabConfigModal.svelte";
	import TabContent from "./components/TabContent.svelte";
	import { tabs, themes } from "./store";
	const Store = require("electron-store");

	let tabConfigModalVisible = true;
	let tabToEdit = null;

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

	tabs.set(tabStore.get("tabs"));
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
				tabToEdit = null;
			}} />
		<TabContent />
		<TabConfigModal
			visible={tabConfigModalVisible}
			{tabToEdit}
			on:close-tab-config-modal={() => {
				tabConfigModalVisible = false;
				tabToEdit = null;
			}} />
	</div>
</main>
