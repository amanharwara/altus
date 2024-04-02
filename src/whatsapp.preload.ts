import { ipcRenderer } from "electron";
import { Theme } from "./stores/themes/common";
import { formatSelectedText } from "./utils/webview/formatSelectedText";

let titleElement: HTMLTitleElement;

window.onload = () => {
  titleElement = document.querySelector("title") as HTMLTitleElement;

  // Reset initial theme
  document.body.querySelectorAll("script").forEach((script) => {
    if (script.innerHTML.includes("systemThemeDark")) {
      script.remove();
    }
  });
  document.body.className = "web";

  document.body.addEventListener("keydown", (event) => {
    if (!event.ctrlKey) return;

    switch (event.key) {
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
      default:
        break;
    }
  });

  document.body.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    if (
      event.target.tagName === "A" &&
      event.target.getAttribute("target") === "_blank"
    ) {
      ipcRenderer.send("open-link", event.target.href);
    }
  });

  registerTitleElementObserver();
};

function getMessageCountFromTitle(title: string) {
  const title_regex = /([0-9]+)/;
  const exec = title_regex.exec(title);
  if (!exec) return 0;

  return parseInt(exec[0], 10);
}

function registerTitleElementObserver() {
  new MutationObserver(function () {
    const title = titleElement.textContent;
    if (!title) return;

    try {
      const messageCount = getMessageCountFromTitle(title);
      const tabId = document.body.dataset.tabId;

      ipcRenderer.send("message-count", {
        messageCount,
        tabId,
      });
    } catch (error) {
      console.error(error);
    }
  }).observe(titleElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
}

function setThemeCSS(css: string) {
  const existingStyle = document.getElementById("altus-style");
  if (existingStyle) {
    existingStyle.innerHTML = css;
  } else {
    const styleElement = document.createElement("style");
    styleElement.id = "altus-style";
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
  }
}

function setThemeColors(colors: NonNullable<Theme["colors"]>) {
  document.body.classList.add("custom");

  setThemeCSS(`
.custom {
  --bg: ${colors.bg};
  --fg: ${colors.fg};
  --ac: ${colors.ac};
  --app-background: var(--bg);
  --intro-background: var(--bg);
  --startup-background: var(--bg);
  --status-background: var(--bg);
  --conversation-panel-background: var(--bg);
  --background-default: color-mix(in srgb, var(--bg), white 2.5%);
  --background-default-active: color-mix(in srgb, var(--bg), white 7%);
  --background-default-hover: color-mix(in srgb, var(--bg), white 6%);
  --incoming-background: color-mix(in srgb, var(--bg), white 9%);
  --incoming-background-deeper: color-mix(in srgb, var(--bg), white 3.5%);
  --outgoing-background: color-mix(in srgb, var(--bg), white 12.5%);
  --outgoing-background-deeper: color-mix(in srgb, var(--bg), white 6.5%);
  --system-message-background: color-mix(in srgb, var(--bg), white 10%);
  --notification-e2e-background: color-mix(in srgb, var(--bg), white 10%);
  --notification-non-e2e-background: color-mix(in srgb, var(--bg), white 10%);
  --dropdown-background: color-mix(in srgb, var(--bg), white 10%);
  --dropdown-background-hover: color-mix(in srgb, var(--bg), white 2.5%);
  --panel-header-background: color-mix(in srgb, var(--bg), white 5%);
  --panel-background-colored: color-mix(in srgb, var(--bg), white 5%);
  --search-input-container-background: color-mix(in srgb, var(--bg), white 5%);
  --search-input-container-background-active: color-mix(in srgb, var(--bg), white 5%);
  --search-input-background: color-mix(in srgb, var(--bg), white 2.5%);
  --compose-input-background: var(--bg);
  --compose-input-border: color-mix(in srgb, var(--bg), white 15%);
  --rich-text-panel-background: color-mix(in srgb, var(--bg), white 7%);
  --drawer-background: var(--bg);
  --drawer-section-background: var(--bg);
  --avatar-placeholder-background: color-mix(in srgb, var(--bg), white 20%);
  --butterbar-update-background: color-mix(in srgb, var(--bg), white 8%);
  --butterbar-update-icon: var(--ac);
  --drawer-background-deep: color-mix(in srgb, var(--bg), black 10%);
  --modal-background: color-mix(in srgb, var(--bg), white 1%);
  --modal-backdrop: color-mix(in srgb, var(--bg), transparent 10%);
  --icon-ack: var(--ac);
  --checkbox-background: var(--ac);
}

@media (min-width: 1441px) {
  #app > div > [tabindex], [data-animate-status-v3-modal-background] > div:first-child {
    border: 1px solid color-mix(in srgb, var(--bg), white 15%);
    border-radius: 4px;
  }
}
  `);
}

ipcRenderer.on("set-theme", (event, theme: Theme) => {
  document.body.classList.remove("custom");

  if (theme.id === "dark") {
    document.body.classList.add("dark");
  } else if (theme.id === "default") {
    document.body.classList.remove("dark");
  }

  if (theme.css) {
    setThemeCSS(theme.css);
  }

  if (theme.colors) {
    setThemeColors(theme.colors);
  }
});

ipcRenderer.on("format-text", (e, wrapper) => {
  formatSelectedText(wrapper);
});

ipcRenderer.on("set-id", (e, id) => {
  if (!document.body.dataset.tabId) {
    // send back initial message count
    ipcRenderer.send("message-count", {
      messageCount: getMessageCountFromTitle(
        titleElement.textContent as string
      ),
      tabId: id,
    });
  }

  document.body.dataset.tabId = id;
});
