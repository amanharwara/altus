const { remote, ipcRenderer } = require("electron");

var ses = remote.session.defaultSession;

ses.flushStorageData();
ses.clearStorageData({
  storages: ["appcache", "serviceworkers", "cachestorage", "websql", "indexdb"],
});

if (window.navigator.serviceWorker) {
  window.navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

window.onload = () => {
  const title_element = document.querySelector(".landing-title");
  if (title_element && title_element.innerHTML.includes("Google Chrome")) {
    window.location.reload();
  }
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
