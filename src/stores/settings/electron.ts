import Store from "electron-store";
import { type Settings, getDefaultSettings } from "./common";

export const electronSettingsStore = new Store<Settings>({
  name: "settings",
  defaults: getDefaultSettings(),
});
