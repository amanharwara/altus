/** Migrate v3 tabs to v4 */
const migrateTab = (tab) => {
  if (!tab.config) {
    return {
      id: tab.id,
      name: tab.name,
      config: {
        theme: tab.theme,
        notifications: tab.notifications,
        sound: tab.sound,
        utilityBar: tab.utility_bar,
        color: tab.tab_color,
        spellChecker: tab.spellcheck,
      },
    };
  } else {
    return tab;
  }
};

export default migrateTab;
