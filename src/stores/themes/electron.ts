import Store from "electron-store";
import { type ThemeStore, ThemeStoreDefaults } from "./common";

export const electronThemeStore = new Store<ThemeStore>({
  name: "themes",
  defaults: ThemeStoreDefaults(),
});
