const fs = require("fs");
const path = require("path");

/** @typedef {import("../types").TabType} TabType */

/**
 * Deletes unused tab partitions to free up space
 * @param {TabType[]} tabs
 * @param {TabType} previouslyClosedTab
 * @param {string} userDataPath
 */
const pruneUnusedPartitions = (tabs, previouslyClosedTab, userDataPath) => {
  const partitionsDirPath = path.join(userDataPath, "Partitions");
  if (fs.existsSync(partitionsDirPath)) {
    const partitions = fs.readdirSync(partitionsDirPath);
    const tabIds = [];
    tabs.forEach((tab) => {
      tabIds.push(tab.id);
    });
    if (previouslyClosedTab) {
      tabIds.push(previouslyClosedTab.id);
    }
    partitions
      .filter((id) => !tabIds.includes(id))
      .forEach((partition) => {
        fs.rmSync(path.join(partitionsDirPath, partition), {
          recursive: true,
        });
      });
  }
};

module.exports = pruneUnusedPartitions;
