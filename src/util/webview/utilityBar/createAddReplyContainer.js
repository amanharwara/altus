const createAddReplyContainer = () => {
  let addReplyContainer = document.createElement("div");
  addReplyContainer.className = "add-reply-container";
  addReplyContainer.style = `position: absolute;
  bottom: 130%;
  background: inherit;
  padding: 10px;
  border-radius: 3px;
  display: none;`;
  addReplyContainer.innerHTML = `
  <div class="label-input" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
    <span class="label" style="margin-right: 10px;">Label:</span>
    <input type="text" class="ub-input" id="label-input">
  </div>
  <div class="message-input" style="margin-bottom: 5px; display: flex; flex-direction: column;">
    <span class="label" style="margin-bottom: 5px;">Message:</span>
    <textarea class="ub-input" id="message-input"></textarea>
  </div>
  <div class="add-reply-button ub-button" id="add-reply-button" style="width: 100%; box-sizing: border-box; text-align: center; display: block;">+ Add Reply</div>
  `;
  return addReplyContainer;
};
module.exports = createAddReplyContainer;
