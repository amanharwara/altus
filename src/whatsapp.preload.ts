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

ipcRenderer.on("set-theme", (event, theme: Theme) => {
  if (theme.id === "dark") {
    document.body.classList.add("dark");
  } else if (theme.id === "default") {
    document.body.classList.remove("dark");
  }

  setThemeCSS(theme.css ? theme.css : "");
});
