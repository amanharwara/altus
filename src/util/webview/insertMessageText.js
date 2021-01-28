function insertMessageText(text, autoSend = false) {
  const message_input = document.querySelector(
    "#main footer div[contenteditable]"
  );

  if (!message_input) return false;

  return setTimeout(() => {
    message_input.innerHTML = text;

    const focusEvent = new FocusEvent("focus", {
      bubbles: true,
    });
    message_input.dispatchEvent(focusEvent);

    const inputEvent = new InputEvent("input", {
      bubbles: true,
    });
    message_input.dispatchEvent(inputEvent);

    if (autoSend) send_message();
  }, 0);
}

module.exports = insertMessageText;
