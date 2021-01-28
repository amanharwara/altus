const Store = require("electron-store");

const quickRepliesStore = new Store({
  name: "quick_replies",
});

const addQuickReply = ({ tabId, replyId, label, message }) => {
  let quickReplies = quickRepliesStore.get(tabId);
  quickReplies.push({
    id: replyId,
    label,
    message,
  });
  quickRepliesStore.set(tabId, quickReplies);
};

module.exports = addQuickReply;
