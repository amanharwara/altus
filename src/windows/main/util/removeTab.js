const {
    quickRepliesStore
} = require('../store/quickReplies');

/**
 * Remove tab
 * @param {Element} closeTabElement "Close Tab" button element
 */
function removeTab(closeTabElement) {

    // Get the tabs list
    let tabsList = Array.from(tabStore.get('tabs'));

    // Get the next sibling of current tab
    let nextSibling = closeTabElement.closest('li').nextElementSibling.querySelector('a');

    // Toggles to the next sibling tab
    tabs.toggle(nextSibling);

    // Get Tab ID
    let tabID = closeTabElement.parentElement.getAttribute('data-tab-id');

    // Remove the tab from the tab list
    closeTabElement.closest('li').remove();

    // Remove the tab content
    document.querySelector(`#tab-content-${tabID}`).remove();

    // Removes the tab from the list
    tabsList = tabsList.filter(tab => tab.id !== tabID);

    // Sets the new tab list
    tabStore.set('tabs', tabsList);

    if (quickRepliesStore.get('replyStore').find(x => x.id === tabID)) quickRepliesStore.set('replyStore', quickRepliesStore.get('replyStore').filter(x => x.id !== tabID));
}

module.exports = {
    removeTab
}