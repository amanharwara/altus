const {
    ipcRenderer
} = require('electron');
var submitThemeButton = document.getElementById('submit');
submitThemeButton.addEventListener('click', function(e) {
    var cssCode = document.querySelector('#css-theme').value;
    var name = document.querySelector('#theme-name').value;
    e.preventDefault();
    ipcRenderer.send('theme:change', {
        name: name || `theme-${Math.round(Math.random() * 2)}`,
        css: cssCode
    });
});