import { ipcRenderer } from "electron";
import { Theme } from "./stores/themes/common";
import { formatSelectedText } from "./utils/webview/formatSelectedText";

window.onload = () => {
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
};

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
  --app-background: var(--bg);
  --intro-background: var(--bg);
  --startup-background: var(--bg);
  --conversation-panel-background: var(--bg);
  --background-default: color-mix(in srgb, var(--bg), white 2.5%);
  --background-default-active: color-mix(in srgb, var(--bg), white 7%);
  --panel-header-background: color-mix(in srgb, var(--bg), white 5%);
  --search-input-container-background: color-mix(in srgb, var(--bg), white 5%);
  --search-input-container-background-active: color-mix(in srgb, var(--bg), white 5%);
  --search-input-background: color-mix(in srgb, var(--bg), white 2.5%);
  --rich-text-panel-background: color-mix(in srgb, var(--bg), white 7%);
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
