const Store = require("electron-store");

const quickRepliesStore = new Store({
  name: "quick_replies",
});

const initializeQuickReplies = (tabId) => {
  quickRepliesStore.set(tabId, []);
};

module.exports = initializeQuickReplies;
