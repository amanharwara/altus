const createFormattingContainer = () => {
  let formattingContainer = document.createElement("div");
  formattingContainer.className = "formatting-container";
  formattingContainer.style = `display: flex;
  flex-direction: column;
  margin-right: 1rem;`;
  formattingContainer.innerHTML = `
  <div class="section-title">Formatting:</div>
  <div class="formatting-options" style="display: flex;">
    <div title="Bold" class="ub-button format bold" data-wrapper="*" style="font-weight: 900;">B</div>
    <div title="Italic" class="ub-button format italic" data-wrapper="_" style="font-style: italic;">I</div>
    <div title="Strikethrough" class="ub-button format strikethrough" data-wrapper="~" style="text-decoration: line-through;">S</div>
    <div title="Monospace" class="ub-button format monospace" data-wrapper="\`\`\`" style="font-family: monospace;  ">&lt;&gt;</div>
  </div>
  `;
  return formattingContainer;
};

module.exports = createFormattingContainer;
