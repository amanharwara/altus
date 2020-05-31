const {
    addTabToDOM
} = require('./addTabToDOM');
const {
    removeTab
} = require('./removeTab');
const {
    addNewTab
} = require('./addNewTab');
const {
    setupExistingTabs
} = require('./setupExistingTabs');
const {
    changeTabName
} = require('./changeTabName');
const {
    setTabTheme
} = require('./setTabTheme');
const {
    setTabBarVisibility
} = require('./setTabBarVisibility');
const {
    toggleNotifications
} = require('./toggleNotifications');
const {
    toggleSound
} = require('./toggleSound');
const {
    toggleExperimentalFeatures
} = require('./toggleExperimentalFeatures');
const {
    zoom
} = require('./zoom');
const {
    getActiveTab
} = require('./getActiveTab');

module.exports = {
    toggleExperimentalFeatures,
    getActiveTab,
    zoom,
    toggleSound,
    toggleNotifications,
    setTabBarVisibility,
    addTabToDOM,
    changeTabName,
    setTabTheme,
    addNewTab,
    removeTab,
    setupExistingTabs
}