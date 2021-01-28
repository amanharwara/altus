const Store = require("electron-store");

const quickRepliesStore = new Store({
  name: "quick_replies",
});

const removeQuickReply = (tabId, replyId) => {
  let quickRepliesArray = Array.from(quickRepliesStore.get(tabId));
  quickRepliesArray = quickRepliesArray.filter((reply) => reply.id !== replyId);
  quickRepliesStore.set(tabId, quickRepliesArray);
};

module.exports = removeQuickReply;
