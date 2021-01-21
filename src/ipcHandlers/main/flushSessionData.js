const flushSessionData = ({ sender }) => {
  let session = sender.session;
  session.flushStorageData();
  session.clearStorageData({
    storages: [
      "appcache",
      "serviceworkers",
      "cachestorage",
      "websql",
      "indexdb",
    ],
  });
};

module.exports = flushSessionData;
