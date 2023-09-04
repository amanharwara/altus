export type Tab = {
  id: string;
  name: string;
  messageCount?: number;
  config: {
    theme: string;
    notifications: boolean;
    sound: boolean;
    color: string;
    spellChecker: boolean;
  };
};

export type TabStore = {
  tabs: Tab[];
  previouslyClosedTab: Tab | null;
  selectedTabId: string | undefined;
};

export const TabStoreDefaults = (): TabStore => ({
  tabs: [],
  previouslyClosedTab: null,
  selectedTabId: undefined,
});

export type ElectronTabStoreIpcApi = {
  getStore: () => Promise<TabStore>;
  setTabs: (tabs: Tab[]) => Promise<void>;
  setPreviouslyClosedTab: (tab: Tab | null) => Promise<void>;
  setSelectedTabId: (id: string | undefined) => Promise<void>;
};
