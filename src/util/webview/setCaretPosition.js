function setCaretPosition({
  focus_offset,
  anchor_offset,
  focus_node,
  wrapper_length,
}) {
  let selection = window.getSelection();
  let range = document.createRange();
  let offset =
    focus_offset > anchor_offset
      ? focus_offset + wrapper_length
      : anchor_offset + wrapper_length;
  range.setStart(focus_node.firstChild, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

module.exports = setCaretPosition;
