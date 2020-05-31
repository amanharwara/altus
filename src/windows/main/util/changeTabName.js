/**
 * Change the name of the tab
 * @param {string} tabId 
 */
function changeTabName(tabId, name) {
    document.querySelector(`[data-tab-id*="${tabId}"] .tabName`).innerHTML = escape(name);
}

module.exports = {
    changeTabName
}