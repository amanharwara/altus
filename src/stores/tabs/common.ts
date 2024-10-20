import { nanoid } from "nanoid";

export type Tab = {
  id: string;
  name: string;
  messageCount?: number;
  config: {
    theme: string;
    media: boolean;
    notifications: boolean;
    sound: boolean;
    color: string | null;
    spellChecker: boolean;
  };
};

export type TabStore = {
  tabs: Tab[];
  previouslyClosedTab: Tab | null;
  selectedTabId: string | undefined;
};

export const getDefaultTab = (): Tab => ({
  id: nanoid(),
  name: "New Tab",
  messageCount: 0,
  config: {
    theme: "dark",
    notifications: true,
    media: true,
    sound: true,
    color: null,
    spellChecker: true,
  },
});

export const TabStoreDefaults = (): TabStore => ({
  tabs: [],
  previouslyClosedTab: null,
  selectedTabId: undefined,
});

export type ElectronTabStoreIpcApi = {
  getStore: () => Promise<TabStore>;
  set: <T extends keyof TabStore>(key: T, value: TabStore[T]) => Promise<void>;
};
