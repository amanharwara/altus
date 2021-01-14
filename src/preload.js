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

ipcRenderer.on("set-theme", (e, theme) => {
  switch (theme) {
    case "default":
      document.body.classList.remove("dark");
      break;
    case "dark":
      document.body.classList.add("dark");
      break;
  }
  new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        switch (theme) {
          case "default":
            document.body.classList.remove("dark");
            break;
          case "dark":
            document.body.classList.add("dark");
            break;
        }
        observer.disconnect();
      }
    });
  }).observe(document.body, {
    attributes: true,
  });
});
