import i18n, { InitOptions } from "i18next";
import fsBackend from "i18next-fs-backend";
import { fallbackLanguage, languages } from "./langauges.config";

export const i18nOptions: InitOptions = {
  backend: {
    loadPath: "./locales/{{lng}}/{{ns}}.json",
    addPath: "./locales/{{lng}}/{{ns}}.missing.json",
    jsonIndent: 2,
  },
  saveMissing: true,
  fallbackLng: fallbackLanguage,
  supportedLngs: languages,
};

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(fsBackend);

export { i18n };
