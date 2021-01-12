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

type ThemeType = {
  name: string;
  css: string;
  colors?: {
    bg: string;
    fg: string;
    ac: string;
  };
};

export { TabType, ThemeType };
