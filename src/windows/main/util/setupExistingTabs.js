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
    }
}

module.exports = {
    setupExistingTabs
}