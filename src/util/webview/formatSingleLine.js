/**
 * @param {Selection} selection Selection object
 * @param {string} wrapper Character to wrap around selected text
 */
function formatSingleLine(selection, wrapper) {
  let anchor_offset = selection.anchorOffset;
  let focus_offset = selection.focusOffset;

  if (anchor_offset < focus_offset) {
    focus_offset += 1;
  }

  let anchor_node_value = selection.anchorNode.nodeValue;

  if (anchor_node_value) {
    let anchor_node_value_as_array = Array.from(anchor_node_value);
    anchor_node_value_as_array.splice(anchor_offset, 0, wrapper);

    if (selection.focusOffset > 0) {
      anchor_node_value_as_array.join("");
      anchor_node_value_as_array = Array.from(anchor_node_value_as_array);
      anchor_node_value_as_array.splice(focus_offset, 0, wrapper);
    }

    selection.anchorNode.nodeValue = anchor_node_value_as_array.join("");

    return 1;
  } else {
    return 0;
  }
}

module.exports = formatSingleLine;
