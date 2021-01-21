/**
 * @param {Selection} selection Selection object
 * @param {string} wrapper Character to wrap around selected text
 */
function formatMultiLine(selection, wrapper) {
  let anchor_offset = selection.anchorOffset;
  let focus_offset = selection.focusOffset;

  let anchor_node_value = selection.anchorNode.nodeValue;
  let anchor_node_value_as_array = Array.from(anchor_node_value);
  anchor_node_value_as_array.splice(anchor_offset, 0, wrapper);
  selection.anchorNode.nodeValue = anchor_node_value_as_array.join("");

  let focus_node_value = selection.focusNode.nodeValue;
  let focus_node_value_as_array = Array.from(focus_node_value);
  focus_node_value_as_array.splice(focus_offset, 0, wrapper);
  selection.focusNode.nodeValue = focus_node_value_as_array.join("");
}

module.exports = formatMultiLine;
