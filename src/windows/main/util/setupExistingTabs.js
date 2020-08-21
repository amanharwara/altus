/**
 * Setup existing tabs at the start
 */
function setupExistingTabs() {
    // Checks whether the existing tabs list is empty or not
    if (Array.from(tabStore.get('tabs')).length !== 0 && Array.from(tabStore.get('tabs')).length !== null) {
        // Adds every existing tab to the DOM
        tabStore.get('tabs').forEach(tab => {
            addTabToDOM(tab.id, tab.name);
        });
        if (settings.get("settings").find((s) => s.id === "rememberActiveTab").value === true) {
            if (!tabStore.get("active_tab_id")) {
                tabStore.set("active_tab_id", document.querySelector('[id^="tab-content"]:not([hidden])').id.replace("tab-content-", ""));
            } else {
                tabs.toggle(`#tab-content-${tabStore.get("active_tab_id")}`);
            }
        }
    }
}

module.exports = {
    setupExistingTabs
}