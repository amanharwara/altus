type TabType = {
  id: string;
  name: string;
  active: boolean;
  config: {
    theme: string;
    notifications: boolean;
    sound: boolean;
    utilityBar: boolean;
    color: string;
    spellChecker: boolean;
  };
};

export { TabType };
