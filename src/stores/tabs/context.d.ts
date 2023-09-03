import { type Tab } from "./common";

declare global {
  interface Window {
    electronTabStore: {
      getTabs: () => Promise<Tab[]>;
      getPreviouslyClosedTab: () => Promise<Tab | null>;
    };
  }
}
