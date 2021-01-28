function sendMessage() {
  setTimeout(() => {
    const send_button_span = document.querySelector(
      "#main footer button span[data-icon=send]"
    );
    if (!send_button_span) return false;

    const send_button = send_button_span.parentNode;

    const click_event = new MouseEvent("click", {
      bubbles: true,
    });
    send_button.dispatchEvent(click_event);

    return true;
  }, 0);
}

module.exports = sendMessage;
