const Color = require("color");

/**
 * Add tab to DOM
 * @param {string} tab_id ID of the tab
 * @param {string} tabName Name of the tab
 */
function addTabToDOM(tab_id, tabName) {
    // Gets the tab's current settings
    let tabSettings = tabStore.get("tabs").find((x) => x.id === tab_id);

    let tab_bg_color = Color(
        tabSettings.tab_color ? tabSettings.tab_color : "#2a3440"
    ).hex().toString();
    let tab_fg_color = Color(tab_bg_color).isDark() ? "#FFFFFF" : "#000000";

    // Create tab element
    let tabElement = document.createRange().createContextualFragment(
        `<li><a data-tab-id="${tab_id}" style="background: ${tab_bg_color} !important; color: ${tab_fg_color};"  href="#tab-content-${tab_id}"><span class="tabName">${escape(
      tabName
    )}</span> <span class="lni lni-cog"></span><span class="lni lni-close"></span></a></li>`
    );

    // Create tab content element
    let tabContentElement = document
        .createRange()
        .createContextualFragment(
            `<div id="tab-content-${tab_id}"><webview id="whatsapp-${tab_id}" preload="./whatsapp.js" src="https://web.whatsapp.com/" useragent="${window.navigator.userAgent.replace(
        /(altus|Electron)([^\s]+\s)/g,
        ""
      )}" partition="persist:${tab_id}"></webview></div>`
        );

    // Prepend tab element to tab list
    document.querySelector("#tabs-list-").prepend(tabElement);

    // Add tab content div
    document
        .querySelector("#main-script")
        .parentNode.insertBefore(
            tabContentElement,
            document.querySelector("#selectr-src")
        );

    // Setup tabs after adding new one
    tabs.setup();

    // Toggle the new tab
    tabs.toggle(`#tab-content-${tab_id}`);

    document.querySelector(`#whatsapp-${tab_id}`).addEventListener('dom-ready', () => {
        setTabTheme(
            document.querySelector(`#whatsapp-${tab_id}`),
            themeName,
        );

        setUtilityBar(document.querySelector(`#whatsapp-${tab_id}`), tabSettings.utility_bar);
    });

    // Adds event listener for close tab button
    document
        .querySelector(`[data-tab-id*="${tab_id}"]`)
        .querySelector(".lni-close")
        .addEventListener("click", () => {
            // Check if "Tab Close Prompt" setting is enabled
            if (
                settings.get("settings").find((s) => s.id === "tabClosePrompt")
                .value === true
            ) {
                Swal.fire({
                    title: `<h2>Do you really want to close the tab <i>"${escape(
            tabName
          )}"</i> ?</h2>`,
                    customClass: {
                        title: "prompt-title",
                        popup: "edit-popup close-popup",
                        confirmButton: "edit-popup-button prompt-confirm-button prompt-button",
                        cancelButton: "edit-popup-button prompt-cancel-button prompt-button",
                        closeButton: "edit-popup-close-button",
                        header: "edit-popup-header",
                    },
                    width: "50%",
                    showCancelButton: true,
                    confirmButtonText: "Close",
                    buttonsStyling: false,
                }).then((result) => {
                    if (result.value) {
                        // Remove the tab after prompt
                        removeTab(
                            document
                            .querySelector(`[data-tab-id*="${tab_id}"]`)
                            .querySelector(".lni-close")
                        );
                    }
                });
            } else {
                // Remove the tab directly
                removeTab(
                    document
                    .querySelector(`[data-tab-id*="${tab_id}"]`)
                    .querySelector(".lni-close")
                );
            }
        });

    // Sets the tab theme
    let themeName = tabSettings.theme;
    // Gets the CSS of theme if it exists otherwise gets Default CSS
    let currentThemeCSS = themes.get("themes").find((x) => x.name === themeName) ?
        themes.get("themes").find((x) => x.name === themeName).css :
        themes.get("themes").find((x) => x.name === "Default").css;

    // Toggles notifications according to setting
    toggleNotifications(
        document.querySelector(`#whatsapp-${tab_id}`),
        tabSettings.notifications,
        true
    );

    // Toggles sound according to setting
    toggleSound(
        document.querySelector(`#whatsapp-${tab_id}`),
        tabSettings.sound,
        true
    );

    // Adds event listener for tab settings button
    document
        .querySelector(`[data-tab-id*="${tab_id}"]`)
        .querySelector(".lni-cog")
        .addEventListener("click", () => {
            let tabSettings = tabStore.get("tabs").find((x) => x.id === tab_id);
            Swal.fire({
                title: `Tab Preferences`,
                customClass: {
                    title: "edit-popup-title",
                    popup: "edit-popup",
                    confirmButton: "edit-popup-button edit-popup-confirm-button",
                    cancelButton: "edit-popup-button edit-popup-cancel-button",
                    closeButton: "edit-popup-close-button",
                    header: "edit-popup-header",
                },
                html: `<div class="inputs">
                    <div class="input-field">
                        <div class="label">Name:</div>
                        <div class="input-flex"><input class="textbox" placeholder="Name of instance" id="${tab_id}-name-textbox" type="text"></div>
                    </div>
                    <div class="input-field">
                        <div class="label" data-selection-value="" id="${tab_id}-theme-value">Theme:</div>
                        <select id="${tab_id}-theme-select">
                        </select>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Notifications:
                        <button class="help tooltip tooltip-top"
                        data-tooltip="Changing this setting will cause the page to be refreshed.">?</button></div>
                        <div class="input-checkbox">
                            <input title="Changing this setting will cause the page to be refreshed" type="checkbox" id="${tab_id}-notification-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Sound:</div>
                        <div class="input-checkbox">
                            <input type="checkbox" id="${tab_id}-sound-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label with-help">Utility Bar:
                            <button class="help tooltip tooltip-top"
                                data-tooltip="This enables a utility bar above the textbox where you can quickly format your text and save Quick Replies.">?</button>
                        </div>
                        <div class="input-checkbox">
                            <input type="checkbox" id="${tab_id}-utility-bar-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Tab Color:</div>
                        <div class="input-checkbox">
                            <input type="color" id="${tab_id}-tab-color" class="color-input">
                        </div>
                    </div>
                </div>`,
                showCancelButton: true,
                reverseButtons: true,
                confirmButtonText: "Confirm",
                buttonsStyling: false,
                padding: "1rem 1.5rem",
                width: "auto",
                onRender: () => {
                    // Initiate theme selection on tab edit
                    let tabEditSelectr = new choices(
                        document.getElementById(`${tab_id}-theme-select`), {
                            searchEnabled: true,
                            choices: themesList,
                        }
                    );

                    // Set current theme on select box
                    tabEditSelectr.setChoiceByValue(tabSettings.theme);
                    document
                        .getElementById(`${tab_id}-theme-value`)
                        .setAttribute(
                            "data-selection-value",
                            tabEditSelectr.getValue(true)
                        );

                    tabEditSelectr.passedElement.element.addEventListener(
                        "choice",
                        (e) => {
                            document
                                .getElementById(`${tab_id}-theme-value`)
                                .setAttribute("data-selection-value", e.detail.choice.value);
                        }
                    );

                    // Set name of tab
                    document.getElementById(`${tab_id}-name-textbox`).value =
                        tabSettings.name;
                    // Set notification setting
                    document.getElementById(`${tab_id}-notification-toggle`).checked =
                        tabSettings.notifications;
                    // Set sound setting
                    document.getElementById(`${tab_id}-sound-toggle`).checked =
                        tabSettings.sound;
                    // Set utility bar setting
                    document.getElementById(`${tab_id}-utility-bar-toggle`).checked =
                        tabSettings.utility_bar;

                    // Set color setting
                    document.getElementById(
                            `${tab_id}-tab-color`
                        ).value = tabSettings.tab_color ?
                        Color(tabSettings.tab_color).hex().toString() :
                        "#2a3440";
                },
            }).then((result) => {
                if (result.value) {
                    // Get all the new values
                    let name =
                        document.getElementById(`${tab_id}-name-textbox`).value ||
                        tabSettings.name;
                    let notifications = document.getElementById(
                        `${tab_id}-notification-toggle`
                    ).checked;
                    let sound = document.getElementById(`${tab_id}-sound-toggle`).checked;
                    let utility_bar = document.getElementById(`${tab_id}-utility-bar-toggle`).checked;
                    let tab_color = document.getElementById(`${tab_id}-tab-color`).value;
                    let theme = document
                        .getElementById(`${tab_id}-theme-value`)
                        .getAttribute("data-selection-value");

                    // Create object from new values
                    let tab = {
                        id: tab_id,
                        name,
                        notifications,
                        sound,
                        theme,
                        utility_bar,
                        tab_color,
                    };

                    // Get the tabs list in array form
                    let tabsList = Array.from(tabStore.get("tabs"));

                    // Find the original tab object in array
                    let tabInList = tabsList.find((x) => x.id === tab.id);

                    // Get the index of the original tab
                    let indexOfTab = tabsList.indexOf(tabInList);

                    // Replace original tab with new tab
                    tabsList[indexOfTab] = tab;

                    // Set new tabs list
                    tabStore.set("tabs", tabsList);

                    if (name !== tabInList.name) {
                        // Change the name of the tab
                        changeTabName(tab_id, name);
                    }

                    if (sound !== tabInList.sound) {
                        // Toggle sound
                        toggleSound(
                            document.querySelector(`#whatsapp-${tab_id}`),
                            sound,
                            false
                        );
                    }

                    if (utility_bar !== tabInList.utility_bar) {
                        setUtilityBar(
                            document.querySelector(`#whatsapp-${tab_id}`),
                            utility_bar
                        );
                    }

                    if (tab_color !== tabInList.tab_color) {
                        let bg = Color(tab_color).hex().toString();
                        let fg = Color(tab_color).isDark() ? "#FFFFFF" : "#000000";
                        document.querySelector(
                            `[data-tab-id="${tab_id}"]`
                        ).setAttribute('style', `background: ${bg} !important; color: ${fg} !important;`);
                    }

                    if (theme !== tabInList.theme) {
                        setTabTheme(
                            document.querySelector(`#whatsapp-${tab_id}`),
                            theme,
                        );
                    }

                    if (notifications !== tabInList.notifications) {
                        location.reload();
                    }
                }
            });
        });
}

module.exports = {
    addTabToDOM,
};