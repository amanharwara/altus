const {
  remote,
  ipcRenderer,
} = require("electron");

const Store = require("electron-store");

const themes = new Store({
  name: "themes",
});

const quick_replies_store = new Store({
  name: "quick_replies"
});

// Fix for "WhatsApp works with Chrome 36+" issue . DO NOT REMOVE
var ses = remote.session.defaultSession;

ses.flushStorageData();
ses.clearStorageData({
  storages: ["appcache", "serviceworkers", "cachestorage", "websql", "indexdb"],
});

if (window.navigator.serviceWorker) {
  window.navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

window.onload = () => {
  const title_element = document.querySelector(".landing-title");
  if (title_element && title_element.innerHTML.includes("Google Chrome 49+")) {
    window.location.reload();
  }

  // Message Indicator
  // Using MutationObserver to check for changes in the title of the WhatsApp page and sending an IPC message to the main process
  new MutationObserver(function (mutations) {
    let title = mutations[0].target.innerText;
    let title_regex = /([0-9]+)/;
    let number = title_regex.exec(title) ?
      parseInt(title_regex.exec(title)[0]) !== 0 &&
      parseInt(title_regex.exec(title)[0]) !== undefined &&
      parseInt(title_regex.exec(title)[0]) !== null ?
      parseInt(title_regex.exec(title)[0]) :
      null :
      null;
    ipcRenderer.send("message-indicator", number);
  }).observe(document.querySelector("title"), {
    subtree: true,
    childList: true,
    characterData: true,
  });

  new MutationObserver((mutations) => {
    // Check when WhatsApp is done loading
    if (
      mutations[0].removedNodes &&
      mutations[0].removedNodes[0].id === "startup"
    ) {
      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.addedNodes.length > 0 &&
            Array.from(mutation.addedNodes).find((node) => node.id === "main")
          ) {
            if (window.utility_bar_enabled) {
              enable_utility_bar();
            } else {
              disable_utility_bar();
            }

            new MutationObserver((mutations) => {
              if (window.utility_bar_enabled) {
                for (let i = 0; i < mutations.length; i++) {
                  let mutation = mutations[i];

                  if (
                    mutation.removedNodes.length > 0 &&
                    (mutation.removedNodes[0].classList.contains("_1qDvT") ||
                      mutation.removedNodes[0].classList.contains("_36Lgj"))
                  ) {
                    if (!document.querySelector("._36Lgj")) {
                      document.querySelector(
                        "footer"
                      ).previousElementSibling.style.height = "47px";
                      document.querySelector(".utility-bar").style.display =
                        "flex";
                      break;
                    }
                  }

                  if (
                    mutation.addedNodes.length > 0 &&
                    (mutation.addedNodes[0].classList.contains("_1qDvT") ||
                      mutation.addedNodes[0].classList.contains("_36Lgj"))
                  ) {
                    document.querySelector(".utility-bar").style.display =
                      "none";
                    break;
                  }
                }
              }
            }).observe(document.querySelector("footer"), {
              childList: true,
              subtree: true,
            });
          }
        });
      }).observe(document.querySelector(".two"), {
        subtree: true,
        childList: true,
      });
    }
  }).observe(document.querySelector("#app"), {
    subtree: true,
    childList: true,
  });

  // Mouse wheel event listener for zoom
  document.body.addEventListener("wheel", (e) => {
    // Mouse wheel delta value. (+1 when scroll up | -1 when scroll down)
    const delta = Math.sign(e.deltaY);

    if (e.ctrlKey) {
      switch (delta) {
        case -1:
          ipcRenderer.send("zoom-in");
          break;

        case +1:
          ipcRenderer.send("zoom-out");
          break;

        default:
          break;
      }
    }
  });

  // Open links in external browser
  document.body.addEventListener("click", (e) => {
    if (
      e.target.tagName === "A" &&
      e.target.getAttribute("target") === "_blank"
    ) {
      ipcRenderer.send("link-open", e.target.href);
    }
  });
};

ipcRenderer.on("theme", (_, tab_info) => {
  let theme_name = tab_info.theme;

  let {
    tabId
  } = tab_info;

  document.body.dataset.tabid = tabId;

  let theme = themes.get("themes").find((theme) => theme.name === theme_name);

  if (theme_name === "Dark") {
    if (!document.body.classList.contains("dark")) {
      document.body.classList.add("dark");
      document.body.classList.remove("dark-plus");
      new MutationObserver((mutations, observer) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === "class" &&
            !document.body.classList.contains("dark")
          ) {
            if (!document.body.classList.contains("default")) {
              document.body.classList.add("dark");
            }
            observer.disconnect();
          }
        });
      }).observe(document.body, {
        attributes: true,
      });
    }
    if (document.querySelector(`#whatsapp-style-${tabId}`))
      document.querySelector(`#whatsapp-style-${tabId}`).innerHTML = "";
    return;
  }

  if (theme_name === "Default") {
    document.body.classList.add("default");
    document.body.classList.remove("dark");
    document.body.classList.remove("dark-plus");
    if (document.querySelector(`#whatsapp-style-${tabId}`))
      document.querySelector(`#whatsapp-style-${tabId}`).innerHTML = "";
    return;
  }

  document.body.classList.remove("default");

  if (document.querySelector(`#whatsapp-style-${tabId}`)) {
    document.body.classList.add("dark-plus");
    document.querySelector(`#whatsapp-style-${tabId}`).innerHTML = theme.css;
  } else {
    document.body.classList.add("dark-plus");
    let theme_element = document.createElement("style");
    theme_element.id = `whatsapp-style-${tabId}`;
    theme_element.innerHTML = theme.css;
    document.head.appendChild(theme_element);
  }
});

ipcRenderer.on("utility-bar", (_, enabled) => {
  window.utility_bar_enabled = enabled;

  if (enabled) {
    enable_utility_bar();
  } else {
    disable_utility_bar();
  }
});

function enable_utility_bar() {
  console.log("utility bar enabled");
  document.querySelector("footer").previousElementSibling.style.height = "47px";

  let utility_bar = document.createElement("div");
  utility_bar.className = "utility-bar";
  utility_bar.style = `height: 47px;
  max-height: 47px;
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 98.5%;
  background: var(--gray-100);
  padding: 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;`;

  let formatting_container = document.createElement("div");
  formatting_container.className = "formatting-container";
  formatting_container.style = `display: flex;
  flex-direction: column;
  margin-right: 1rem;`;
  formatting_container.innerHTML = `
  <style id="utility-bar-style">
    .dark .utility-bar, .dark-plus .utility-bar {
      background: var(--gray-850) !important;
      color: #fff;
    }
    .ub-button {
      padding: 0.35rem 0.5rem;
      margin: 0 0.35rem 0 0;
      background: var(--green-deep);
      color: #fff;
      border-radius: 2px;
      user-select: none;
      cursor: pointer;
    }
    .ub-button:not(.quick-reply) {
      display: flex;
      align-items: center;
    }
    .ub-button:hover {
      background: var(--green);
    }
    .quick-replies::before {
      content: "|";
      font-weight: 100;
      color: var(--gray-600);
    }
    .quick-replies {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      max-width: 100%;
      width: 100%;
      overflow-x: auto;
      flex-wrap: nowrap;
    }
    .quick-reply {
      max-width: 7.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex-shrink: 0;
    }
    .quick-reply:first-child {
      margin-left: 0.35rem;
    }
    .section-title {
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.35rem;
    }
    .ub-input:focus {
      outline: 1px solid var(--green-deep);
    }
    .show {
      display: block !important;
    }
    .ub-remove {
      margin-left: 0.5rem;
      font-weight: bold;
    }
  </style>
  <div class="section-title">Formatting:</div>
  <div class="formatting-options" style="display: flex;">
    <div title="Bold" class="ub-button format bold" data-wrapper="*" style="font-weight: 900;">B</div>
    <div title="Italic" class="ub-button format italic" data-wrapper="_" style="font-style: italic;">I</div>
    <div title="Strikethrough" class="ub-button format strikethrough" data-wrapper="~" style="text-decoration: line-through;">S</div>
    <div title="Monospace" class="ub-button format monospace" data-wrapper="\`\`\`" style="font-family: monospace;  ">&lt;&gt;</div>
  </div>
  `;

  let quick_reply_container = document.createElement("div");
  quick_reply_container.className = "quick-reply-container";
  quick_reply_container.style = `position: relative;
  flex-grow: 2;
  max-width: 85%;
  background: inherit;`;
  quick_reply_container.innerHTML = `
  <div class="section-title">Quick Replies:</div>
  <div class="quick-reply-subcontainer" style="display: flex;">
    <div class="quick-reply-add ub-button" id="toggle-add-reply" title="Add Quick Reply">+</div>
    <div class="quick-replies">
      ${get_quick_replies_as_html(document.body.dataset.tabid)}
    </div>
  </div>
  `;

  let add_reply_container = document.createElement("div");
  add_reply_container.className = "add-reply-container";
  add_reply_container.style = `position: absolute;
  bottom: 130%;
  background: inherit;
  padding: 10px;
  border-radius: 3px;
  display: none;`;
  add_reply_container.innerHTML = `
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

  quick_reply_container.appendChild(add_reply_container);

  utility_bar.appendChild(formatting_container);
  utility_bar.appendChild(quick_reply_container);

  document.querySelector("footer").appendChild(utility_bar);

  document
    .querySelector("._2-aNW")
    .scroll(0, document.querySelector("._2-aNW").scrollHeight);

  document.querySelector(".utility-bar").addEventListener("click", (e) => {
    if (e.target.classList.contains("ub-remove")) {
      confirm_remove_quick_reply(document.body.dataset.tabid, e.target.dataset.replyid);
    }

    if (e.target.classList.contains("ub-input")) {
      e.preventDefault();
      e.target.focus();
    }

    if (e.target.classList.contains("format")) {
      format_selected_text(e.target.getAttribute("data-wrapper"));
    }

    if (e.target.closest('.quick-reply') && !e.target.classList.contains('ub-remove')) {
      insert_message_text(e.target.closest(".quick-reply").dataset.message, true);
    }

    if (e.target.id === "toggle-add-reply") {
      if (document.querySelector(".add-reply-container").classList.contains("show")) {
        document.querySelector(".add-reply-container").classList.remove("show");
      } else {
        document.querySelector(".add-reply-container").classList.add("show");
      }
    }

    if (e.target.id === "add-reply-button") {
      if (document.getElementById("label-input").value.length > 0 && document.getElementById("message-input").value.length > 0) {
        let tab_id = document.body.dataset.tabid;
        let label = document.getElementById("label-input").value;
        add_quick_reply({
          tab_id,
          reply_id: (quick_replies_store.get(tab_id).length + 1) + label.split(' ')[0],
          label,
          message: document.getElementById("message-input").value
        });
        document.getElementById("label-input").value = "";
        document.getElementById("message-input").value = "";
        refresh_quick_replies(document.body.dataset.tabid);
      }
    }
  });
}

function disable_utility_bar() {
  console.log("utility bar disabled");

  document.querySelector("footer").previousElementSibling.style.height = "0px";
  document.querySelector(".utility-bar").remove();
}

function send_message() {
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

function insert_message_text(text, autoSend = false) {
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

function set_caret_position({
  focus_offset,
  anchor_offset,
  focus_node,
  wrapper_length,
}) {
  let selection = window.getSelection();
  let range = document.createRange();
  let offset =
    focus_offset > anchor_offset ?
    focus_offset + wrapper_length :
    anchor_offset + wrapper_length;
  range.setStart(focus_node.firstChild, offset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * @param {string} wrapper Character to wrap around selected text
 */
function format_selected_text(wrapper) {
  const selection = window.getSelection();

  let focus_offset = selection.focusOffset;
  let anchor_offset = selection.anchorOffset;

  if (selection.anchorNode == selection.focusNode) {
    switch (format_single_line_selection(selection, wrapper)) {
      case 0:
        insert_message_text(wrapper + wrapper);
        setTimeout(() => {
          set_caret_position({
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
    format_multi_line_selection(selection, wrapper);
  }

  const replacement_text = selection.anchorNode.parentElement.innerHTML;
  insert_message_text(replacement_text);

  setTimeout(() => {
    set_caret_position({
      focus_offset,
      anchor_offset,
      focus_node: selection.focusNode,
      wrapper_length: wrapper.length,
    });
  }, 1);
}

/**
 * @param {Selection} selection Selection object
 * @param {string} wrapper Character to wrap around selected text
 */
function format_multi_line_selection(selection, wrapper) {
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

/**
 * @param {Selection} selection Selection object
 * @param {string} wrapper Character to wrap around selected text
 */
function format_single_line_selection(selection, wrapper) {
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

/**
 * @param {object} quick_reply_object 
 * @param {string} quick_reply_object.tab_id Tab ID
 * @param {string} quick_reply_object.reply_id Quick Reply ID
 * @param {string} quick_reply_object.label Label for the quick reply
 * @param {string} quick_reply_object.message Message for the quick reply
 */
function add_quick_reply({
  tab_id,
  reply_id,
  label,
  message
}) {
  let quick_replies = quick_replies_store.get(tab_id);
  quick_replies.push({
    id: reply_id,
    label,
    message
  });
  quick_replies_store.set(tab_id, quick_replies);
}

/**
 * @param {string} tab_id tab id
 */
function get_quick_replies_as_html(tab_id) {
  let quick_replies = quick_replies_store.get(tab_id);
  let quick_replies_as_html = "";
  if (quick_replies) {
    for (let i = quick_replies.length - 1; i >= 0; i--) {
      let quick_reply = quick_replies[i];
      let quick_reply_element = document.createElement("div");
      quick_reply_element.className = "ub-button quick-reply";
      quick_reply_element.id = quick_reply.id;
      quick_reply_element.innerHTML = `<span class="ub-label">${quick_reply.label}</span><span class="ub-remove" data-replyid="${quick_reply.id}">×</span>`;
      quick_reply_element.dataset.message = quick_reply.message;
      quick_reply_element.title = quick_reply.message;

      quick_replies_as_html += quick_reply_element.outerHTML;
    }
  } else {
    initialize_quick_replies(tab_id);
  }
  return quick_replies_as_html;
}

/**
 * @param {string} tab_id tab id
 */
function refresh_quick_replies(tab_id) {
  let quick_replies = get_quick_replies_as_html(tab_id);
  document.querySelector(".quick-replies").innerHTML = quick_replies;
}

/**
 * @param {string} tab_id tab id
 */
function initialize_quick_replies(tab_id) {
  quick_replies_store.set(tab_id, []);
}

/**
 * @param {string} tab_id 
 * @param {string} reply_id 
 */
function remove_quick_reply(tab_id, reply_id) {
  let quick_replies_array = Array.from(quick_replies_store.get(tab_id));
  quick_replies_array = quick_replies_array.filter(reply => reply.id !== reply_id);
  quick_replies_store.set(tab_id, quick_replies_array);
}

function confirm_remove_quick_reply(tab_id, reply_id) {
  let confirm_message_element = document.createElement("div");
  confirm_message_element.id = "confirm-message-container";
  confirm_message_element.style = `position: absolute;
  bottom: 130%;
  background: inherit;
  padding: 10px;
  border-radius: 3px;`;
  confirm_message_element.innerHTML = `<div class="ub-label">Remove quick reply?</div>
  <div class="ub-buttons" style="display: flex; margin-top: 0.5rem;">
  <div class="ub-button" id="remove-yes">Yes</div>
  <div class="ub-button" id="remove-no">No</div>
  </div>`;
  confirm_message_element.addEventListener("click", (e) => {
    if (e.target.id === "remove-yes") {
      remove_quick_reply(tab_id, reply_id);
      refresh_quick_replies(tab_id);
      document.getElementById("confirm-message-container").remove();
    }
    if (e.target.id === "remove-no") {
      document.getElementById("confirm-message-container").remove();
    }
  });
  if (!document.getElementById("confirm-message-container")) {
    document.querySelector(".quick-reply-container").appendChild(confirm_message_element);
  }
}

ipcRenderer.on("format-text", (_, wrapper) => {
  format_selected_text(wrapper);
});