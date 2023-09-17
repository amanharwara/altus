import { existsSync, readFileSync, writeFileSync } from "fs";
import { fallbackLanguage, Language } from "./langauges.config";
import path from "path";
import { ipcMain } from "electron";
import { isDev } from "../utils/isDev";

export class ElectronI18N {
  protected language: Language = fallbackLanguage;
  private translation: Record<string, string> = {};
  private fallbackTranslation: Record<string, string> = {};
  private languageChangeCallback?: (_language: Language) => void;
  private languageLoadedCallback?: () => void;
  private didInitialize = false;

  initialize = async () => {
    ipcMain.handle("get-translations", async () => {
      return {
        current: this.translation,
        fallback: this.fallbackTranslation,
      };
    });

    ipcMain.handle("key-missing", async (_, key: string) => {
      this.keyMissing(key);
    });

    try {
      const fallbackTranslations = await this.loadLanguage(fallbackLanguage);
      this.fallbackTranslation = fallbackTranslations;
      this.didInitialize = true;
    } catch (error) {
      console.error(error);
    }
  };

  getLanguage = () => {
    return this.language;
  };

  setLanguage = (language: Language) => {
    this.language = language;
    this.onLanguageChange(language);
  };

  setLanguageChangeCallback = (callback: (_language: Language) => void) => {
    this.languageChangeCallback = callback;
  };

  setLanguageLoadedCallback = (callback: () => void) => {
    this.languageLoadedCallback = callback;
  };

  onLanguageChange = (language: Language) => {
    if (!this.didInitialize) {
      throw new Error("ElectronI18N not initialized");
    }

    if (!this.languageChangeCallback) {
      throw new Error("Language change callback not set");
    }

    this.languageChangeCallback(language);

    this.loadLanguage(language)
      .then((translation) => {
        this.translation = translation;
      })
      .then(this.onLanguageLoaded)
      .catch(console.error);
  };

  loadLanguage = async (language: Language) => {
    const filePath = path.join(
      __dirname,
      `./locales/${language}/translation.json`
    );
    if (!existsSync(filePath)) {
      throw new Error(`Language file not found: ${filePath}`);
    }
    const contents = readFileSync(filePath, { encoding: "utf-8" });
    return JSON.parse(contents);
  };

  onLanguageLoaded = () => {
    if (!this.languageLoadedCallback) {
      throw new Error("Language loaded callback not set");
    }

    this.languageLoadedCallback();
  };

  keyMissing = (key: string) => {
    if (!isDev) {
      return;
    }
    try {
      console.log(`Key missing: ${key}`);
      const missingKeysFile = `./public/locales/${this.language}/translation.missing.json`;
      if (!existsSync(missingKeysFile)) {
        writeFileSync(missingKeysFile, "{}");
      }
      const contents = readFileSync(missingKeysFile, { encoding: "utf-8" });
      if (!contents) {
        writeFileSync(missingKeysFile, JSON.stringify({ [key]: key }, null, 2));
        return;
      }
      const missingKeys = JSON.parse(contents);
      missingKeys[key] = key;
      writeFileSync(missingKeysFile, JSON.stringify(missingKeys, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  t = (key: string) => {
    if (!this.didInitialize) {
      throw new Error("ElectronI18N not initialized");
    }
    if (!this.translation[key]) {
      this.keyMissing(key);
      return this.fallbackTranslation[key] || key;
    }
    return this.translation[key];
  };
}

export const electronI18N = new ElectronI18N();
