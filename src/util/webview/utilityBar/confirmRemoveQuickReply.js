const refreshQuickReplies = require("./refreshQuickReplies");
const removeQuickReply = require("./removeQuickReply");

const confirmRemoveQuickReply = (tabId, replyId) => {
  let confirmMessageElement = document.createElement("div");
  confirmMessageElement.id = "confirm-message-container";
  confirmMessageElement.style = `position: absolute;
  bottom: 130%;
  background: inherit;
  padding: 10px;
  border-radius: 3px;`;
  confirmMessageElement.innerHTML = `<div class="ub-label">Remove quick reply?</div>
  <div class="ub-buttons" style="display: flex; margin-top: 0.5rem;">
  <div class="ub-button" id="remove-yes">Yes</div>
  <div class="ub-button" id="remove-no">No</div>
  </div>`;
  confirmMessageElement.addEventListener("click", (e) => {
    if (e.target.id === "remove-yes") {
      removeQuickReply(tabId, replyId);
      refreshQuickReplies(tabId);
      document.getElementById("confirm-message-container").remove();
    }
    if (e.target.id === "remove-no") {
      document.getElementById("confirm-message-container").remove();
    }
  });
  if (!document.getElementById("confirm-message-container")) {
    document
      .querySelector(".quick-reply-container")
      .appendChild(confirmMessageElement);
  }
};
module.exports = confirmRemoveQuickReply;
