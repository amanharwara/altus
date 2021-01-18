import { get, writable } from "svelte/store";
const Store = require("electron-store");
import type { ThemeType } from "../types";
import migrateTab from "../util/migrateTab";
import { migrateTheme } from "../util/theme";
import { defaultSettings, migrateSettings, validateSettings } from "./settings";

let modals = writable({
  tabConfigModalVisible: false,
  themeManagerVisible: false,
  settingsManagerVisible: false,
});

let tabStore = new Store({
  name: "tabs",
  defaults: {
    tabs: [],
  },
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

let tabs = writable([]);

tabs.set(tabStore.get("tabs").map(migrateTab));
tabs.subscribe((tabs) => {
  tabStore.set(
    "tabs",
    tabs.map((tab) => {
      return { ...tab, messageCount: 0 };
    })
  );
  if (tabs.length === 0) {
    modals.update((modals) => {
      return {
        ...modals,
        tabConfigModalVisible: true,
      };
    });
  }
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

export { tabs, themes, paths, modals, settings };
