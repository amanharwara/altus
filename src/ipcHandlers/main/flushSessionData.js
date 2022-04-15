const flushSessionData = ({ sender }) => {
  let session = sender.session;
  session.flushStorageData();
  session.clearStorageData({
    storages: ["serviceworkers"],
  });
};

module.exports = flushSessionData;
