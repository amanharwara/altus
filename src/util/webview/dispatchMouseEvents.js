const dispatchMouseEvents = (element, events) => {
  events.forEach(function (eventName) {
    var event = new MouseEvent(eventName, {
      bubbles: true,
      cancelable: true,
      view: window,
      button: 0,
    });
    element.dispatchEvent(event);
  });
};

module.exports = dispatchMouseEvents;
