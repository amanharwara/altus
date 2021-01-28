const initializeQuickReplies = require("./initializeQuickReplies");
const Store = require("electron-store");

const quickRepliesStore = new Store({
  name: "quick_replies",
});

const getQuickRepliesAsHTML = (tabId) => {
  let quickReplies = quickRepliesStore.get(tabId);
  let quickRepliesAsHTML = "";
  if (quickReplies) {
    for (let i = quickReplies.length - 1; i >= 0; i--) {
      let quickReply = quickReplies[i];
      let quickReplyElement = document.createElement("div");
      quickReplyElement.className = "ub-button quick-reply";
      quickReplyElement.id = quickReply.id;
      quickReplyElement.innerHTML = `<span class="ub-label">${quickReply.label}</span><span class="ub-remove" data-replyid="${quickReply.id}">×</span>`;
      quickReplyElement.dataset.message = quickReply.message;
      quickReplyElement.title = quickReply.message;

      quickRepliesAsHTML += quickReplyElement.outerHTML;
    }
  } else {
    initializeQuickReplies(tabId);
  }
  return quickRepliesAsHTML;
};

module.exports = getQuickRepliesAsHTML;
