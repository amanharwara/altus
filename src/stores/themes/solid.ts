import { createStore, unwrap } from "solid-js/store";
import { ThemeStoreDefaults, type ThemeStore, Theme } from "./common";
import { createEffect } from "solid-js";

const [themeStore, updateThemeStore] = createStore<ThemeStore>(
  ThemeStoreDefaults()
);

window.electronThemeStore.getStore().then((store) => {
  updateThemeStore(store);
});

createEffect(() => {
  const themes = unwrap(themeStore.themes);
  window.electronThemeStore.setThemes(themes);
});

export function addTheme(theme: Theme) {
  updateThemeStore("themes", (themes) => [...themes, theme]);
}

export function updateTheme(theme: Theme) {
  updateThemeStore("themes", (themes) =>
    themes.map((t) => (t.id === theme.id ? theme : t))
  );
}

export function upsertTheme(theme: Theme) {
  updateThemeStore("themes", (themes) => {
    const existingTheme = themes.find((t) => t.id === theme.id);
    if (existingTheme) {
      return themes.map((t) => (t.id === theme.id ? theme : t));
    } else {
      return [...themes, theme];
    }
  });
}

export function removeTheme(theme: Theme) {
  updateThemeStore("themes", (themes) =>
    themes.filter((t) => t.id !== theme.id)
  );
}

export { themeStore };
