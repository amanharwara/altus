const { ipcRenderer } = require("electron");
const dispatchMouseEvents = require("./util/webview/dispatchMouseEvents");
const addChatIDs = require("./util/webview/addChatIDs");
const formatSelectedText = require("./util/webview/formatSelectedText");
const enableUtilityBar = require("./util/webview/utilityBar/enableUtilityBar");
const disableUtilityBar = require("./util/webview/utilityBar/disableUtilityBar");
const Store = require("electron-store");
const elementSelectors = require("./util/webview/utilityBar/elementSelectors");

let quickRepliesStore = new Store({
  name: "quick_replies",
  defaults: {},
});

ipcRenderer.send("flush-session-data");

window.onload = () => {
  const title_element = document.querySelector(".landing-title");
  if (title_element && title_element.innerHTML.includes("Google Chrome")) {
    window.location.reload();
  }

  document.body.querySelectorAll("script").forEach((script) => {
    if (script.innerHTML.includes("systemThemeDark")) {
      script.remove();
    }
  });
  document.body.className = "web";

  document.body.addEventListener("click", (e) => {
    if (
      e.target.tagName === "A" &&
      e.target.getAttribute("target") === "_blank"
    ) {
      ipcRenderer.send("open-link", e.target.href);
    }
  });

  document.body.addEventListener("wheel", (e) => {
    const delta = Math.sign(e.deltaY);
    if (e.ctrlKey) {
      switch (delta) {
        case -1:
          ipcRenderer.send("zoom", "in");
          break;
        case +1:
          ipcRenderer.send("zoom", "out");
          break;
        default:
          break;
      }
    }
  });

  document.body.addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
      switch (e.key) {
        case "=":
        case "+":
          ipcRenderer.send("zoom", "in");
          break;
        case "-":
          ipcRenderer.send("zoom", "out");
          break;
        case "0":
          ipcRenderer.send("zoom", "reset");
          break;
        case "b":
          formatSelectedText("*");
          break;
        case "i":
          formatSelectedText("_");
          break;
        case "s":
          formatSelectedText("~");
          break;
        case "m":
          formatSelectedText("```");
          break;
      }
    }
  });

  new MutationObserver(function (mutations) {
    let title = mutations[0].target.innerText;
    let title_regex = /([0-9]+)/;
    let messageCount = title_regex.exec(title)
      ? parseInt(title_regex.exec(title)[0])
        ? parseInt(title_regex.exec(title)[0])
        : null
      : null;
    let tabId = document.body.id;
    ipcRenderer.send("message-indicator", {
      messageCount,
      tabId,
    });
  }).observe(document.querySelector("title"), {
    subtree: true,
    childList: true,
    characterData: true,
  });

  new MutationObserver((mutations) => {
    // Check when WhatsApp is done loading
    if (
      mutations[0].removedNodes.length > 0 &&
      mutations[0].removedNodes[0].id === "startup"
    ) {
      addChatIDs();

      // Update chat IDs when a chat is added/removed.
      new MutationObserver(() => {
        addChatIDs();
      }).observe(
        document.querySelector('#pane-side [role="region"]', {
          subtree: true,
          childList: true,
        })
      );

      // Remove "Update available" message
      if (
        document.querySelector("._3z9_h").innerText.includes("Update available")
      ) {
        document.querySelector("._3z9_h").style.display = "none";
      }
    }

    if (document.querySelector(".two")) {
      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            if (
              Array.from(mutation.addedNodes).find((node) => node.id === "main")
            ) {
              if (window.utilityBar) {
                if (document.querySelector(".utility-bar"))
                  document.querySelector(".utility-bar").remove();
                if (!document.querySelector(".utility-bar")) enableUtilityBar();
              } else {
                if (document.querySelector(".utility-bar")) disableUtilityBar();
              }
            }

            if (
              Array.from(mutation.addedNodes).find(
                (node) =>
                  node.classList &&
                  node.classList.length > 0 &&
                  node.classList.contains(elementSelectors.emojiPanel)
              )
            ) {
              if (document.querySelector(".utility-bar")) disableUtilityBar();
            }

            if (
              Array.from(mutation.addedNodes).find(
                (node) =>
                  node.classList &&
                  node.classList.length > 0 &&
                  node.classList.contains(elementSelectors.replyPanel)
              )
            ) {
              let replyHeight = document.querySelector(
                `.${elementSelectors.replyPanel}`
              ).scrollHeight;
              document.querySelector(
                "footer"
              ).previousElementSibling.style.height = `${replyHeight + 47}px`;
              document.querySelector(
                ".utility-bar"
              ).style.transform = `translateY(-${replyHeight}px)`;
            }
          }

          if (mutation.removedNodes.length > 0) {
            if (
              Array.from(mutation.removedNodes).find(
                (node) =>
                  (node.classList &&
                    node.classList.length > 0 &&
                    node.classList.contains(elementSelectors.emojiPanel)) ||
                  node.classList.contains(elementSelectors.replyPanel)
              )
            ) {
              if (!document.querySelector(".utility-bar")) {
                enableUtilityBar();
              } else {
                document.querySelector(
                  "footer"
                ).previousElementSibling.style.height = "47px";
                document.querySelector(".utility-bar").style.transform = "";
              }
            }
          }
        });
      }).observe(document.querySelector(".two"), {
        subtree: true,
        childList: true,
      });
    }
  }).observe(document.querySelector("#app"), {
    subtree: true,
    childList: true,
  });
};

const appendTheme = (css) => {
  if (document.getElementById("altus-style")) {
    document.getElementById("altus-style").innerHTML = css;
  } else {
    let styleEl = document.createElement("style");
    styleEl.id = "altus-style";
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);
  }
};

ipcRenderer.on("set-id", (e, id) => {
  document.body.id = id;
  let quickReplies = quickRepliesStore.get(id);
  if (!quickReplies || quickReplies.length === 0) {
    quickRepliesStore.set(id, []);
  }
});

ipcRenderer.on("set-theme", (e, theme) => {
  // Reset classes
  document.body.className = "web";
  document.body.dataset.theme = "default";

  // Apply theme classes
  document.body.classList.add(theme.name);
  document.body.dataset.theme = theme.name;

  if (document.querySelector("footer"))
    document.querySelector("footer").dataset.theme = theme.name;

  // Reset CSS
  let styleEl = document.getElementById("altus-style");
  if (styleEl) styleEl.innerHTML = "";

  // Apply CSS
  appendTheme(theme.css ? theme.css : "");
});

ipcRenderer.on("set-utility-bar", (e, utilityBarEnabled) => {
  if (utilityBarEnabled) {
    window.utilityBar = true;
    if (!document.querySelector(".utility-bar")) enableUtilityBar();
  } else {
    window.utilityBar = false;
    disableUtilityBar();
  }
});

ipcRenderer.on("toggle-notifications", (_, setting) => {
  if (!setting) {
    window.Notification = "";
  } else {
    // Proxy the original Notification constructor
    let NativeNotification = Notification;

    // Replace the original Notification constructor with custom one
    Notification = function (title, options) {
      let notification = new NativeNotification(title, options);

      notification.addEventListener("click", function () {
        // Maximize the window and activate the tab that the message was in.
        ipcRenderer.send(
          "activate-window-and-tab",
          document.body.dataset.tabid
        );

        // Simulate click on the particular chat element to open it.
        let chat = document
          .getElementById(options.tag)
          .querySelector('[role="option"] > * > :last-child');
        dispatchMouseEvents(chat, [
          "mouseover",
          "mousedown",
          "mouseup",
          "click",
        ]);
      });

      notification.addEventListener = function () {
        return true;
      };
      notification.attachEvent = function () {
        return true;
      };
      notification.addListener = function () {
        return true;
      };

      return notification;
    };

    Notification.prototype = NativeNotification.prototype;
    Notification.permission = NativeNotification.permission;
    Notification.requestPermission =
      NativeNotification.requestPermission.bind(Notification);
  }
});

ipcRenderer.on("format-text", (e, wrapper) => {
  formatSelectedText(wrapper);
});
