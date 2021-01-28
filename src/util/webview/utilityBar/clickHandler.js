const formatSelectedText = require("../formatSelectedText");
const insertMessageText = require("../insertMessageText");
const addQuickReply = require("./addQuickReply");
const confirmRemoveQuickReply = require("./confirmRemoveQuickReply");
const refreshQuickReplies = require("./refreshQuickReplies");

const Store = require("electron-store");

const quickRepliesStore = new Store({
  name: "quick_replies",
});

const clickHandler = (e) => {
  if (e.target.classList.contains("ub-remove")) {
    confirmRemoveQuickReply(document.body.id, e.target.dataset.replyid);
  }

  if (e.target.classList.contains("ub-input")) {
    e.preventDefault();
    e.target.focus();
  }

  if (e.target.classList.contains("format")) {
    formatSelectedText(e.target.getAttribute("data-wrapper"));
  }

  if (e.target.id === "toggle-add-reply") {
    if (
      document.querySelector(".add-reply-container").classList.contains("show")
    ) {
      document.querySelector(".add-reply-container").classList.remove("show");
    } else {
      document.querySelector(".add-reply-container").classList.add("show");
    }
  }

  if (
    e.target.closest(".quick-reply") &&
    !e.target.classList.contains("ub-remove")
  ) {
    insertMessageText(e.target.closest(".quick-reply").dataset.message, true);
  }

  if (e.target.id === "add-reply-button") {
    if (
      document.getElementById("label-input").value.length > 0 &&
      document.getElementById("message-input").value.length > 0
    ) {
      let tabId = document.body.id;
      let label = document.getElementById("label-input").value;
      addQuickReply({
        tabId,
        replyId: quickRepliesStore.get(tabId).length + 1 + label.split(" ")[0],
        label,
        message: document.getElementById("message-input").value,
      });
      document.getElementById("label-input").value = "";
      document.getElementById("message-input").value = "";
      refreshQuickReplies(document.body.id);
    }
  }
};

module.exports = clickHandler;
