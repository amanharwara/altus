import Store from "electron-store";
import { TabStoreDefaults, type TabStore } from "./common";

export const electronTabStore = new Store<TabStore>({
  name: "tabs",
  defaults: TabStoreDefaults(),
});
