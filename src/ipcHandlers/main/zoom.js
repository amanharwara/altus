const zoom = ({ sender }, type) => {
  let currentZoomFactor = sender.getZoomFactor();
  switch (type) {
    case "in":
      sender.setZoomFactor(currentZoomFactor + 0.1);
      break;
    case "out":
      sender.setZoomFactor(currentZoomFactor - 0.1);
      break;
    default:
      sender.setZoomFactor(1);
      break;
  }
};

module.exports = zoom;
