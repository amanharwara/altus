import { get, writable } from "svelte/store";
const Store = require("electron-store");
import type { ThemeType } from "../types";
import migrateTab from "../util/migrateTab";
import { migrateTheme } from "../util/theme";
import { defaultSettings, migrateSettings, validateSettings } from "./settings";

enum ModalType {
  SettingsManager,
  ThemeManager,
  TabConfig,
  NewChatModal,
}

let currentModal = writable<ModalType | null>(null);

let tabStore = new Store({
  name: "tabs",
  defaults: {
    tabs: [],
    previouslyClosedTab: null,
  },
});

let tabs = writable([]);
let previouslyClosedTab = writable(null);

tabs.set(tabStore.get("tabs").map(migrateTab));
previouslyClosedTab.set(tabStore.get("previouslyClosedTab"));
tabs.subscribe((tabs) => {
  tabStore.set(
    "tabs",
    tabs.map((tab) => {
      return { ...tab, messageCount: 0 };
    })
  );
  if (tabs.length === 0) {
    currentModal.set(ModalType.TabConfig);
  }
});
previouslyClosedTab.subscribe((tab) => {
  tabStore.set("previouslyClosedTab", tab);
});

let themeStore = new Store({
  name: "themes",
  defaults: {
    themes: [
      {
        name: "Default",
        id: "default",
        css: "",
      },
      {
        name: "Dark",
        id: "dark",
        css: "",
      },
    ],
  },
});

let themes = writable([]);

themes.set(themeStore.get("themes").map(migrateTheme));
themes.subscribe((themes: ThemeType[]) => {
  themeStore.set("themes", themes.map(migrateTheme));
  let themeIDs = themes.map((theme) => theme.id);
  tabs.update((tabs) =>
    tabs.map((tab) => {
      if (!themeIDs.includes(tab.config.theme)) {
        return {
          ...tab,
          config: {
            ...tab.config,
            theme: "default",
          },
        };
      } else {
        return tab;
      }
    })
  );
});

let paths = writable({
  userData: "",
});

let settingsStore = new Store({
  name: "settings",
  defaults: {
    ...defaultSettings(),
  },
});

let settings = writable({});
if (settingsStore.get("settings")) {
  let settingsArray = settingsStore.get("settings");
  settingsStore.store = validateSettings(migrateSettings(settingsArray));
}
settings.set(validateSettings(settingsStore.store));
settings.subscribe((settings) => {
  settingsStore.store = validateSettings(settings);
});

export {
  tabs,
  themes,
  paths,
  currentModal,
  ModalType,
  settings,
  previouslyClosedTab,
};
