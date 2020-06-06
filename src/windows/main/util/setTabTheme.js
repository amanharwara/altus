/**
 * Set theme of a tab
 * @param {Element} whatsAppElement The whatsapp webview element for the specific tab
 * @param {string} themeCSS The CSS which is supposed to be applied
 * @param {boolean} firstStart Whether the function is being run at the start of the app
 */
function setTabTheme(whatsAppElement, themeCSS, firstStart) {
    let whatsapp = whatsAppElement;

    let cssElementString = `
    if (document.querySelector('.web').classList.contains('dark')) document.querySelector('.web').classList.remove('dark');
    var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
    if (styleElem) {
        styleElem.innerHTML = \`${themeCSS}\`;
    } else if (!styleElem) {
        var styleElement = document.createElement('style');
        styleElement.id = 'whatsapp-style-${whatsapp.id}';
        styleElement.innerHTML = \`${themeCSS}\`;
        document.head.appendChild(styleElement);
    }`;

    let darkThemeString = `
    var styleElem = document.querySelector('#whatsapp-style-${whatsapp.id}');
    if (styleElem) {
        styleElem.innerHTML = "";
    }
    document.querySelector('.web').classList.add('dark');
    `;

    if (firstStart) {
        whatsapp.addEventListener('dom-ready', () => {
            whatsapp.executeJavaScript(themeCSS === 'dark' ? darkThemeString : cssElementString);
        });
    } else {
        whatsapp.executeJavaScript(themeCSS === 'dark' ? darkThemeString : cssElementString);
    }
}

module.exports = {
    setTabTheme
}