type TabType = {
  id: string;
  name: string;
  active: boolean;
  messageCount?: number;
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
  id: string;
  customCSS?: boolean;
  preset?: string;
  colors?: {
    bg: string;
    fg: string;
    ac: string;
  };
};

type SettingType = {
  value: boolean | string;
  name: string;
  description: string;
  options?: string[];
};

type Settings = { [k: string]: SettingType };

type CloneableMenuItem = {
  commandId?: number;
  accelerator?: string;
  type?: string;
  submenu?: CloneableMenuItem[];
  label?: string;
  id?: any;
  focused?: boolean;
};

export { TabType, ThemeType, SettingType, Settings, CloneableMenuItem };
