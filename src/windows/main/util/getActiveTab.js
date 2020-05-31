/**
 * Get active tab and whatsapp element in an object
 * @returns {Object.<Element, {tab: Element, whatsapp: Element}>} Active Tab and WhatsApp Element
 */
function getActiveTab() {
    let activeTab = document.querySelector('[id^="tab-content"]:not([hidden])');
    let activeWhatsApp = activeTab.querySelector('webview');

    return {
        tab: activeTab,
        whatsapp: activeWhatsApp
    }
}
module.exports = {
    getActiveTab
}