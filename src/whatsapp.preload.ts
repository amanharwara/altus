import { ipcRenderer } from "electron";
import { Theme } from "./stores/themes/common";

window.onload = () => {
  // Reset initial theme
  document.body.querySelectorAll("script").forEach((script) => {
    if (script.innerHTML.includes("systemThemeDark")) {
      script.remove();
    }
  });
  document.body.className = "web";
};

ipcRenderer.on("set-theme", (event, theme: Theme) => {
  if (theme.id === "dark") {
    document.body.classList.add("dark");
  } else if (theme.id === "default") {
    document.body.classList.remove("dark");
  }
});
