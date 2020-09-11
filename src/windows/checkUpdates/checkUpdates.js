// Import custom titlebar module
const customTitlebar = require("custom-electron-titlebar");

// Import extra electron modules
const { app, process, Menu } = require("electron").remote;
const { ipcRenderer } = require("electron");

// Import electron store module for settings
const Store = require("electron-store");

// Load the main settings into settings variable
let settings = new Store({
  name: "settings",
});

// Import getReleases function
const { getReleases } = require("./getReleases");

// Checks if custom titlebar is enabled in settings & the platform isn't a Mac
if (
  Array.from(settings.get("settings")).find((s) => s.id === "customTitlebar")
    .value === true &&
  process.platform !== "darwin"
) {
  // Create main window titlebar
  const mainTitlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#202224"),
    icon: "../otherAssets/icon.ico",
    itemBackgroundColor: customTitlebar.Color.fromHex("#1c2028"),
    menu:
      process.platform === "darwin" ? Menu.getApplicationMenu() : new Menu(),
    minimizable: false,
    maximizable: false,
    closeable: true,
  });
  // Setting title explicitly
  mainTitlebar.updateTitle(`Check Updates`);
} else {
  // CSS for when there is no custom titlebar
  let style = document.createElement("style");
  style.innerText = `body {
        margin: 0px;
        overflow:hidden;
        border:0;
    }
    .container{
        padding: 0rem 1rem 0.6rem 1rem;
    }`;
  document.head.appendChild(style);
}

// Set current version
document.querySelector(
  ".version"
).innerHTML = `Current Version: <a onclick="openLink('https://github.com/amanharwara/altus/releases/tag/${app.getVersion()}');" href="">v${app.getVersion()}</a>`;

setCurrentReleaseNotes();

/**
 * Set current version's release notes
 */
async function setCurrentReleaseNotes() {
  // Get current version release notes
  let releases = Array.from(await getReleases());
  let currentVersionNotes = "";

  if (releases[0] !== "Error") {
    let currentVersionRelease = releases.find(
      (a) => a.tag_name === app.getVersion()
    );
    currentVersionNotes = currentVersionRelease
      ? currentVersionRelease.body.replace(/\n/g, "<br>-")
      : "No Release Notes Available.";
  } else {
    currentVersionNotes = `Error: ${releases[1]}. <br> Please check your internet connection.`;
  }

  // Set current version notes
  document.querySelector(".release-notes .content").innerHTML =
    currentVersionNotes.length !== 0
      ? currentVersionNotes
      : "No Release Notes Available.";
}

/**
 * Handle update checks
 */
async function handleUpdateChecks() {
  // Show release notes loader
  toggleElementDisplayProperty(document.querySelector(".notes-loader"), true);
  // Toggle spin effect of update button
  toggleSpinEffect(document.querySelector(".button.update .lni-reload"), true);

  // Get releases
  let releases = await getReleases();
  releases = releases.filter((release) => release.tag_name !== "continuous");
  // Latest release
  let latestRelease = releases[0];

  if (latestRelease !== "Error") {
    // Check if the release isn't the same as current one
    if (latestRelease.tag_name !== app.getVersion()) {
      // Toggle spin effect of update button
      toggleSpinEffect(
        document.querySelector(".button.update .lni-reload"),
        false
      );

      // Release Notes
      let releaseNotes =
        latestRelease.body.length !== 0
          ? latestRelease.body.replace(/\n/g, "<br />")
          : "No release notes.";

      // Set release notes
      document.querySelector(
        ".release-notes .content"
      ).innerHTML = releaseNotes;

      // Notify about new version
      document.querySelector(
        ".version"
      ).innerHTML = `New Version Available: <a onclick="openLink('${latestRelease.html_url}')">v${latestRelease.tag_name}</a>`;

      // Change update button to download button
      document.querySelector(".button.update").classList.add("green");
      document.querySelector(".button.update").innerHTML =
        'Download <span class="lni-chevron-down"></span>';

      // Add items to dropdown
      latestRelease.assets.forEach((asset) => {
        // Asset Name
        let name = asset.name;

        // Asset Download URL
        let url = asset.browser_download_url;

        // Initialize Item Element Variable
        let assetElement = document
          .createRange()
          .createContextualFragment(
            `<div class="item" onclick="openLink('${url}')"><span class="lni-${
              /\.dmg/.test(name)
                ? "apple"
                : /\.exe/.test(name)
                ? "windows"
                : /\.AppImage/.test(name)
                ? "code-alt"
                : "download"
            }"></span> ${name}</div>`
          );

        // Append item element to dropdown
        document.querySelector(".dropdown").appendChild(assetElement);
      });

      // Change download button event listeners
      document
        .querySelector(".button.update")
        .removeEventListener("click", handleUpdateChecks);
      document
        .querySelector(".button.update.green")
        .addEventListener("click", () => {
          // Toggle chevron icons
          if (
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.contains("lni-chevron-down")
          ) {
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.add("lni-chevron-up");
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.remove("lni-chevron-down");
          } else if (
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.contains("lni-chevron-up")
          ) {
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.add("lni-chevron-down");
            document
              .querySelector('.button.green [class^="lni"]')
              .classList.remove("lni-chevron-up");
          }

          // Toggle dropdown
          if (
            document.querySelector(".dropdown").style.display == "none" ||
            document.querySelector(".dropdown").style.display == ""
          ) {
            toggleElementDisplayProperty(
              document.querySelector(".dropdown"),
              true
            );
          } else {
            toggleElementDisplayProperty(
              document.querySelector(".dropdown"),
              false
            );
          }
        });

      // Get rid of release notes loader
      toggleElementDisplayProperty(
        document.querySelector(".notes-loader"),
        false
      );
    } else {
      // Remove release notes loader
      toggleElementDisplayProperty(
        document.querySelector(".notes-loader"),
        false
      );
      // Toggle off spin effect of update button
      toggleSpinEffect(
        document.querySelector(".button.update .lni-reload"),
        false
      );
    }
  } else {
    // Remove release notes loader
    toggleElementDisplayProperty(
      document.querySelector(".notes-loader"),
      false
    );
    // Toggle off spin effect of update button
    toggleSpinEffect(
      document.querySelector(".button.update .lni-reload"),
      false
    );
    // Set error in notes
    document.querySelector(
      ".release-notes .content"
    ).innerHTML = `Error: ${releases[1]} updates. Please check your internet connection.`;
  }
}

// Check Updates button
document
  .querySelector(".button.update")
  .addEventListener("click", handleUpdateChecks);

/**
 * Toggle LNI spin effect of an element
 * @param {Element} element DOM element of which to toggle effect
 * @param {Boolean} toggleBoolean True or False
 */
function toggleSpinEffect(element, toggleBoolean) {
  if (toggleBoolean) {
    // Toggle on spin effect
    element.classList.add("lni-is-spinning");
  } else {
    // Toggle off spin effect
    if (element.classList.contains("lni-is-spinning"))
      element.classList.remove("lni-is-spinning");
  }
}

/**
 * Toggle an elements CSS 'display' property
 * @param {Element} element DOM element
 * @param {boolean} toggleBoolean true or false
 */
function toggleElementDisplayProperty(element, toggleBoolean) {
  if (toggleBoolean) {
    // Toggle on display property
    element.style.display = "block";
  } else {
    // Toggle off display property
    element.style.display = "none";
  }
}

/**
 * Open link in external browser
 * @param {string} link Link to open
 */
function openLink(link) {
  ipcRenderer.send("link-open", link);
}

