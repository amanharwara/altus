import { type ElectronTabStoreIpcApi } from "./common";

declare global {
  interface Window {
    electronTabStore: ElectronTabStoreIpcApi;
  }
}
