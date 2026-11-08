import Store from "electron-store";
import { type ThemeStore, ThemeStoreDefaults } from "./common";

export const electronThemeStore = new Store<ThemeStore>({
  name: "themes",
  defaults: ThemeStoreDefaults(),
});

/**
 * Altus 4.x shipped the built-in "Dark" theme as a large CSS file written
 * for WhatsApp's 2020 markup. That CSS survives in the themes.json of
 * long-time users and, combined with today's WhatsApp, only produces
 * unreadable colour combinations (e.g. light grey text in the white
 * compose box). The built-in themes can't be edited in the UI, so
 * resetting them to the current defaults is safe.
 */
function resetStaleBuiltInThemes() {
  const defaults = ThemeStoreDefaults().themes;
  const themes = electronThemeStore.get("themes");
  let changed = false;

  const cleaned = themes.map((theme) => {
    const builtIn = defaults.find((d) => d.id === theme.id);
    if (!builtIn) return theme;
    if (!theme.css && !theme.colors && !theme.customCSS) return theme;
    changed = true;
    return { ...builtIn };
  });

  if (changed) electronThemeStore.set("themes", cleaned);
}

resetStaleBuiltInThemes();
