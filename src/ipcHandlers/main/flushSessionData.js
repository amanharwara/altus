const flushSessionData = ({ sender }) => {
  let session = sender.session;
  session.flushStorageData();
  session.clearStorageData({
    storages: ["appcache", "cachestorage"],
  });
};

module.exports = flushSessionData;
