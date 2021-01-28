const getQuickRepliesAsHTML = require("./getQuickRepliesAsHTML");

const refreshQuickReplies = (tabId) => {
  let quickReplies = getQuickRepliesAsHTML(tabId);
  document.querySelector(".quick-replies").innerHTML = quickReplies;
};

module.exports = refreshQuickReplies;
