const clickHandler = require("./clickHandler");
const createAddReplyContainer = require("./createAddReplyContainer");
const createFormattingContainer = require("./createFormattingContainer");
const createQuickReplyContainer = require("./createQuickReplyContainer");
const createUtilityBarElement = require("./createUtilityBarElement");
const elementSelectors = require("./elementSelectors");

const enableUtilityBar = () => {
  let utilityBar = createUtilityBarElement();
  let formattingContainer = createFormattingContainer();
  let quickReplyContainer = createQuickReplyContainer();
  let addReplyContainer = createAddReplyContainer();

  quickReplyContainer.appendChild(addReplyContainer);
  utilityBar.appendChild(formattingContainer);
  utilityBar.appendChild(quickReplyContainer);

  document.querySelector("footer").previousElementSibling.style.height = "47px";
  document.querySelector("footer").dataset.theme = document.body.dataset.theme;
  document.querySelector("footer").appendChild(utilityBar);

  let chatPanel = document.querySelector(elementSelectors.chatPanel);
  chatPanel.scroll(0, chatPanel.scrollHeight);

  document
    .querySelector(".utility-bar")
    .addEventListener("click", clickHandler);

  console.log("Utility Bar Enabled");
};

module.exports = enableUtilityBar;
