import { ipcRenderer } from "electron";

const titleRegex = /([0-9]+)/;

window.onload = () => {
  const titleElement = document.querySelector("title") as HTMLTitleElement;

  new MutationObserver(function () {
    const title = titleElement.textContent;
    if (!title) return;

    const executed = titleRegex.exec(title);
    if (!executed) return;

    const messageCount = parseInt(executed[0]);
    console.log(executed, messageCount);
    if (!messageCount || isNaN(messageCount)) return;

    const tabId = document.body.dataset.tabId;
    ipcRenderer.send("update-message-count", {
      messageCount,
      tabId,
    });
  }).observe(titleElement, {
    subtree: true,
    childList: true,
    characterData: true,
  });
};
