import Store from "electron-store";
import { type SettingsStore, SettingsStoreDefaults } from "./common";

export const electronSettingsStore = new Store<SettingsStore>({
  name: "settings",
  defaults: SettingsStoreDefaults(),
});
