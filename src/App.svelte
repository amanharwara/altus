<script lang="ts">
	import TabBar from "./components/TabBar.svelte";
	import TabContent from "./components/TabContent.svelte";
	import { tabs } from "./store";
	const Store = require("electron-store");

	let tabStore = new Store({
		name: "tabs",
		defaults: {
			tabs: [],
		},
	});

	tabs.set(tabStore.get("tabs"));

	tabs.subscribe((tabs) => {
		tabStore.set("tabs", tabs);
	});
</script>

<style>
	main {
		height: 100%;
	}
	.container {
		display: flex;
		flex-flow: column;
		height: 100%;
	}
</style>

<main>
	<div class="container">
		<TabBar />
		<TabContent />
	</div>
</main>
