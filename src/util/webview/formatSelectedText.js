const formatMultiLine = require("./formatMultiLine");
const formatSingleLine = require("./formatSingleLine");
const setCaretPosition = require("./setCaretPosition");
const insertMessageText = require("./insertMessageText");

/**
 * @param {string} wrapper Character to wrap around selected text
 */
function formatSelectedText(wrapper) {
  const message_input = document.querySelector(
    "#main footer div[contenteditable]"
  );

  const selection = window.getSelection();

  let focus_offset = selection.focusOffset;
  let anchor_offset = selection.anchorOffset;

  if (selection.anchorNode == selection.focusNode) {
    switch (formatSingleLine(selection, wrapper)) {
      case 0:
        if (message_input.innerHTML.length !== 0) {
          insertMessageText(wrapper + message_input.textContent + wrapper);
        } else {
          insertMessageText(wrapper + wrapper);
        }
        setTimeout(() => {
          setCaretPosition({
            focus_offset: wrapper.length,
            anchor_offset: wrapper.length,
            focus_node: selection.focusNode,
            wrapper_length: 0,
          });
        }, 1);
        return;
      default:
        break;
    }
  } else {
    formatMultiLine(selection, wrapper);
  }

  const replacement_text = selection.anchorNode.parentElement.innerHTML;
  insertMessageText(replacement_text);

  setTimeout(() => {
    setCaretPosition({
      focus_offset,
      anchor_offset,
      focus_node: selection.focusNode,
      wrapper_length: wrapper.length,
    });
  }, 1);
}

module.exports = formatSelectedText;
