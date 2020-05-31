/**
 * Set Tab Bar Visibility
 * @param {boolean} visible Whether tab bar is visible or not
 */
function setTabBarVisibility(visible) {
    let tabBar = document.querySelector('#tabs-list-');
    let styleEl = document.querySelector('#tabbar-style');
    if (visible) {
        tabBar.style.display = '';
        styleEl.innerHTML = `[role="tabpanel"] {height: 94.3%}`;
    } else {
        tabBar.style.display = 'none';
        styleEl.innerHTML = `[role="tabpanel"] {height: -webkit-fill-available}`;
    }
}

module.exports = {
    setTabBarVisibility
}