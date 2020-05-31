/**
 * Set theme of a tab
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {string} themeCSS The CSS which is supposed to be applied
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function setTabTheme(whatsAppElement, themeCSS, firstStart) {
    let whatsapp = whatsAppElement;

    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            whatsapp.executeJavaScript(`
                        var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
                        if (styleElem) {
                            styleElem.innerHTML = \`${themeCSS}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsapp-style-${whatsapp.id}';
                            styleElement.innerHTML = \`${themeCSS}\`;
                            document.head.appendChild(styleElement);
                        }`);
        });
    } else {
        whatsapp.executeJavaScript(`
                        var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
                        if (styleElem) {
                            styleElem.innerHTML = \`${themeCSS}\`;
                        } else if (!styleElem) {
                            var styleElement = document.createElement('style');
                            styleElement.id = 'whatsapp-style-${whatsapp.id}';
                            styleElement.innerHTML = \`${themeCSS}\`;
                            document.head.appendChild(styleElement);
                        }`);
    }
}

module.exports = {
    setTabTheme
}