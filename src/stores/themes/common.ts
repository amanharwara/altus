export type Theme = {
  id: string;
  name: string;
  css?: string;
  customCSS?: boolean;
  preset?: string;
  colors?: {
    bg: string;
    fg: string;
    ac: string;
  };
};

export type ThemeStore = {
  themes: Theme[];
};

export const ThemeStoreDefaults = (): ThemeStore => ({
  themes: [
    {
      id: "default",
      name: "Default",
      css: "",
    },
    {
      id: "dark",
      name: "Dark",
      css: "",
    },
  ],
});

export type ElectronThemeStoreIpcApi = {
  getStore: () => Promise<ThemeStore>;
  setThemes: (themes: Theme[]) => Promise<void>;
};
