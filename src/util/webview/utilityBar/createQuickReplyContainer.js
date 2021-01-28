const getQuickRepliesAsHTML = require("./getQuickRepliesAsHTML");

const createQuickReplyContainer = () => {
  let quickReplyContainer = document.createElement("div");
  quickReplyContainer.className = "quick-reply-container";
  quickReplyContainer.style = `position: relative;
  flex-grow: 2;
  max-width: 85%;
  background: inherit;`;
  quickReplyContainer.innerHTML = `
  <div class="section-title">Quick Replies:</div>
  <div class="quick-reply-subcontainer" style="display: flex;">
    <div class="quick-reply-add ub-button" id="toggle-add-reply" title="Add Quick Reply">+</div>
    <div class="quick-replies">${getQuickRepliesAsHTML(document.body.id)}</div>
  </div>
  `;
  return quickReplyContainer;
};

module.exports = createQuickReplyContainer;
