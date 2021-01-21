const { ipcRenderer } = require("electron");

ipcRenderer.send("flush-session-data");

if (window.navigator.serviceWorker) {
  window.navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

const dispatchMouseEvent = (element, events) => {
  events.forEach(function (eventName) {
    var event = new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    });
    element.dispatchEvent(event);
  });
};

const addChatIDs = () => {
  if (document.querySelectorAll('#pane-side [role="region"] > *').length > 0) {
    document
      .querySelectorAll('#pane-side [role="region"] > *')
      .forEach((chat) => {
        let internalInstance =
          chat[
            Object.keys(chat).find((key) => key.includes("InternalInstance"))
          ];
        let id =
          internalInstance.memoizedProps.children.props.contact.id._serialized;
        chat.id = id;
      });
  }
};

window.onload = () => {
  const title_element = document.querySelector(".landing-title");
  if (title_element && title_element.innerHTML.includes("Google Chrome")) {
    window.location.reload();
  }

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
      mutations[0].removedNodes &&
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

ipcRenderer.on("set-theme", (e, theme) => {
  let styleEl = document.getElementById("altus-style");
  switch (theme.name) {
    case "Default":
      document.body.classList.remove("dark");
      if (styleEl) styleEl.innerHTML = "";
      break;
    case "Dark":
      document.body.classList.add("dark");
      if (styleEl) styleEl.innerHTML = "";
    default:
      appendTheme(theme.css ? theme.css : "");
      break;
  }
  new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        switch (theme.name) {
          case "Dark":
            document.body.classList.add("dark");
            break;
          default:
            document.body.classList.remove("dark");
            break;
        }
        observer.disconnect();
      }
    });
  }).observe(document.body, {
    attributes: true,
  });
});

ipcRenderer.on("set-utility-bar", (e, value) => {});

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
        dispatchMouseEvent(chat, [
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
    Notification.requestPermission = NativeNotification.requestPermission.bind(
      Notification
    );
  }
});
