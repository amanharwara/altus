function addNewTab() {
    // Create a tab object to use later
    let tab = {
        name: null,
        notifications: null,
        sound: null,
        theme: null,
        experimental: null,
        exp_features: [],
        id: null
    };

    // Get the name (If no name is put by the user, it assigns the name "New Tab")
    tab.name = (document.querySelector('#tab-name-textbox').value !== "" && document.querySelector('#tab-name-textbox').value !== null) ? document.querySelector('#tab-name-textbox').value : 'New Tab';

    // Get notifications setting
    tab.notifications = document.querySelector('#notification-toggle').checked;

    // Get sound setting
    tab.sound = document.querySelector('#sound-toggle').checked;

    // Get experimental features setting
    tab.experimental = document.querySelector('#experimental-toggle').checked;

    // Get the theme
    tab.theme = themeSelect.getValue(true);

    // Get experimental features
    tab.exp_features = experimentalSelect.getValue(true);

    // Assign unique ID to tab
    tab.id = uuid();

    // Get the original tabs list
    let tabsList = Array.from(tabStore.get('tabs'));

    // Push the new tab to the list 
    tabsList.push(tab);

    // Set the new list to the store
    tabStore.set('tabs', tabsList);

    // Adds new tab to the DOM
    addTabToDOM(tab.id, tab.name);

    // Clears the value of all the inputs after tab is added
    document.querySelector('#tab-name-textbox').value = '';
    document.querySelector('#notification-toggle').checked = true;
    document.querySelector('#sound-toggle').checked = true;
    document.querySelector('#experimental-toggle').checked = false;
    themeSelect.setChoiceByValue('Default');
    experimentalSelect.removeActiveItems();
    document.querySelector('.experimental-select .choices').style.display = 'none';
}

module.exports = {
    addNewTab
}