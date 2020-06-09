const Color = require("color");
const {
    checkContrastAndFix
} = require("../../util/checkContrastAndFix");

/**
 * Add tab to DOM
 * @param {string} tabId ID of the tab
 * @param {string} tabName Name of the tab
 */
function addTabToDOM(tabId, tabName) {
    // Gets the tab's current settings
    let tabSettings = tabStore.get("tabs").find((x) => x.id === tabId);

    let tab_bg_color = Color(
        tabSettings.tab_color ? tabSettings.tab_color : "#2a3440"
    ).hex().toString();
    let tab_fg_color = Color(tab_bg_color).isDark() ? "#FFFFFF" : "#000000";

    // Create tab element
    let tabElement = document.createRange().createContextualFragment(
        `<li><a data-tab-id="${tabId}" style="background: ${tab_bg_color} !important; color: ${tab_fg_color};"  href="#tab-content-${tabId}"><span class="tabName">${escape(
      tabName
    )}</span> <span class="lni lni-cog"></span><span class="lni lni-close"></span></a></li>`
    );

    // Create tab content element
    let tabContentElement = document
        .createRange()
        .createContextualFragment(
            `<div id="tab-content-${tabId}"><webview id="whatsapp-${tabId}" preload="./whatsapp.js" src="https://web.whatsapp.com/" useragent="${window.navigator.userAgent.replace(
        /(altus|Electron)([^\s]+\s)/g,
        ""
      )}" partition="persist:${tabId}"></webview></div>`
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
    tabs.toggle(`#tab-content-${tabId}`);

    // Adds event listener for close tab button
    document
        .querySelector(`[data-tab-id*="${tabId}"]`)
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
                            .querySelector(`[data-tab-id*="${tabId}"]`)
                            .querySelector(".lni-close")
                        );
                    }
                });
            } else {
                // Remove the tab directly
                removeTab(
                    document
                    .querySelector(`[data-tab-id*="${tabId}"]`)
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

    setTabTheme(
        document.querySelector(`#whatsapp-${tabId}`),
        themeName === "Dark" ? "dark" : currentThemeCSS,
        true
    );

    // Toggles notifications according to setting
    toggleNotifications(
        document.querySelector(`#whatsapp-${tabId}`),
        tabSettings.notifications,
        true
    );

    // Toggles sound according to setting
    toggleSound(
        document.querySelector(`#whatsapp-${tabId}`),
        tabSettings.sound,
        true
    );

    // Adds event listener for tab settings button
    document
        .querySelector(`[data-tab-id*="${tabId}"]`)
        .querySelector(".lni-cog")
        .addEventListener("click", () => {
            let tabSettings = tabStore.get("tabs").find((x) => x.id === tabId);
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
                        <div class="input-flex"><input class="textbox" placeholder="Name of instance" id="${tabId}-name-textbox" type="text"></div>
                    </div>
                    <div class="input-field">
                        <div class="label" data-selection-value="" id="${tabId}-theme-value">Theme:</div>
                        <select id="${tabId}-theme-select">
                        </select>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Notifications:
                        <button class="help tooltip tooltip-top"
                        data-tooltip="Changing this setting will cause the page to be refreshed.">?</button></div>
                        <div class="input-checkbox">
                            <input title="Changing this setting will cause the page to be refreshed" type="checkbox" id="${tabId}-notification-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Sound:</div>
                        <div class="input-checkbox">
                            <input type="checkbox" id="${tabId}-sound-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label">Tab Color:</div>
                        <div class="input-checkbox">
                            <input type="color" id="${tabId}-tab-color" class="color-input">
                        </div>
                    </div>
                    <div class="toggle-field">
                        <div class="label with-help">
                            <span>Experimental Features:</span>
                            <button class="help tooltip tooltip-top"
                                data-tooltip="Experimental features like online indicator, quick replies, etc require using the WhatsApp API. This makes these features unstable as they can change and break at any time.">?</button>
                        </div>
                        <div class="input-checkbox">
                            <input type="checkbox" id="${tabId}-experimental-toggle" class="checkbox">
                            <div class="toggle-bg"></div>
                        </div>
                    </div>
                    <div class="input-field experimental-select-${tabId}" style="max-width: 50vh;">
                        <select id="${tabId}-experimental-select" multiple>
                            <option value="">Select Features</option>
                            <option value="online-indicator">Online Indicator</option>
                            <option value="quick-replies">Quick Replies</option>
                        </select>
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
                        document.getElementById(`${tabId}-theme-select`), {
                            searchEnabled: true,
                            choices: themesList,
                        }
                    );
                    let experimentalSelect = new choices(
                        document.getElementById(`${tabId}-experimental-select`), {
                            removeItems: true,
                            removeItemButton: true,
                            duplicateItemsAllowed: false,
                            paste: false,
                        }
                    );

                    // Set current theme on select box
                    tabEditSelectr.setChoiceByValue(tabSettings.theme);
                    document
                        .getElementById(`${tabId}-theme-value`)
                        .setAttribute(
                            "data-selection-value",
                            tabEditSelectr.getValue(true)
                        );

                    experimentalSelect.setChoiceByValue(tabSettings.exp_features);
                    document
                        .querySelector(`.experimental-select-${tabId} .choices`)
                        .setAttribute(
                            "data-selection-value",
                            experimentalSelect.getValue(true)
                        );

                    tabEditSelectr.passedElement.element.addEventListener(
                        "choice",
                        (e) => {
                            document
                                .getElementById(`${tabId}-theme-value`)
                                .setAttribute("data-selection-value", e.detail.choice.value);
                        }
                    );

                    experimentalSelect.passedElement.element.addEventListener(
                        "choice",
                        (e) => {
                            let value = experimentalSelect.getValue(true);
                            value.push(e.detail.choice.value);
                            document
                                .querySelector(`.experimental-select-${tabId} .choices`)
                                .setAttribute("data-selection-value", value);
                        }
                    );

                    experimentalSelect.passedElement.element.addEventListener(
                        "removeItem",
                        (e) => {
                            let value = document
                                .querySelector(`.experimental-select-${tabId} .choices`)
                                .getAttribute("data-selection-value")
                                .replace(e.detail.value, "");
                            document
                                .querySelector(`.experimental-select-${tabId} .choices`)
                                .setAttribute("data-selection-value", value);
                        }
                    );

                    // Set name of tab
                    document.getElementById(`${tabId}-name-textbox`).value =
                        tabSettings.name;
                    // Set notification setting
                    document.getElementById(`${tabId}-notification-toggle`).checked =
                        tabSettings.notifications;
                    // Set sound setting
                    document.getElementById(`${tabId}-sound-toggle`).checked =
                        tabSettings.sound;

                    // Set color setting
                    document.getElementById(
                            `${tabId}-tab-color`
                        ).value = tabSettings.tab_color ?
                        Color(tabSettings.tab_color).hex().toString() :
                        "#2a3440";

                    // Set experimental setting
                    document.getElementById(`${tabId}-experimental-toggle`).checked =
                        tabSettings.experimental;

                    if (tabSettings.experimental) {
                        document.querySelector(
                            `.experimental-select-${tabId} .choices`
                        ).style.display = "";
                    } else {
                        document.querySelector(
                            `.experimental-select-${tabId} .choices`
                        ).style.display = "none";
                    }

                    document
                        .getElementById(`${tabId}-experimental-toggle`)
                        .addEventListener("change", (e) => {
                            if (e.target.checked) {
                                document.querySelector(
                                    `.experimental-select-${tabId} .choices`
                                ).style.display = "";
                            } else {
                                document.querySelector(
                                    `.experimental-select-${tabId} .choices`
                                ).style.display = "none";
                            }
                        });
                },
            }).then((result) => {
                if (result.value) {
                    // Get all the new values
                    let name =
                        document.getElementById(`${tabId}-name-textbox`).value ||
                        tabSettings.name;
                    let notifications = document.getElementById(
                        `${tabId}-notification-toggle`
                    ).checked;
                    let sound = document.getElementById(`${tabId}-sound-toggle`).checked;
                    let tab_color = document.getElementById(`${tabId}-tab-color`).value;
                    let theme = document
                        .getElementById(`${tabId}-theme-value`)
                        .getAttribute("data-selection-value");
                    let experimental = document.getElementById(
                        `${tabId}-experimental-toggle`
                    ).checked;
                    let exp_features;

                    exp_features = document
                        .querySelector(`.experimental-select-${tabId} .choices`)
                        .getAttribute("data-selection-value")
                        .split(",")
                        .filter((str) => str.length > 0);

                    // Create object from new values
                    let tab = {
                        id: tabId,
                        name,
                        notifications,
                        sound,
                        theme,
                        experimental,
                        exp_features,
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
                        changeTabName(tabId, name);
                    }

                    if (sound !== tabInList.sound) {
                        // Toggle sound
                        toggleSound(
                            document.querySelector(`#whatsapp-${tabId}`),
                            sound,
                            false
                        );
                    }

                    if (tab_color !== tabInList.tab_color) {
                        let bg = Color(tab_color).hex().toString();
                        let fg = Color(tab_color).isDark() ? "#FFFFFF" : "#000000";
                        document.querySelector(
                            `[data-tab-id="${tabId}"]`
                        ).setAttribute('style', `background: ${bg} !important; color: ${fg} !important;`);
                    }

                    if (theme !== tabInList.theme) {
                        // Set Theme of tab
                        if (theme === "Dark") {
                            setTabTheme(
                                document.querySelector(`#whatsapp-${tabId}`),
                                "dark",
                                false
                            );
                        } else {
                            setTabTheme(
                                document.querySelector(`#whatsapp-${tabId}`),
                                themes.get("themes").find((x) => x.name === theme).css,
                                false
                            );
                        }
                    }

                    if (notifications !== tabInList.notifications) {
                        location.reload();
                    }

                    if (experimental !== tabInList.experimental) {
                        location.reload();
                    }
                }
            });
        });
}

module.exports = {
    addTabToDOM,
};