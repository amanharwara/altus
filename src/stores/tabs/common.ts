export type Tab = {
  id: string;
  name: string;
  active: boolean;
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
};

export const TabStoreDefaults = (): TabStore => ({
  tabs: [],
  previouslyClosedTab: null,
});
