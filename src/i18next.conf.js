const i18n = require("i18next");
const backend = require("i18next-fs-backend");
const langConf = require("./lang.conf");

const i18nOptions = {
  backend: {
    loadPath: "./locales/{{lng}}/{{ns}}.json",
    addPath: "./locales/{{lng}}/{{ns}}.missing.json",
    jsonIndent: 2,
  },
  interpolation: {
    espaceValue: true,
  },
  saveMissing: true,
  fallbackLng: langConf.fallbackLang,
  whitelist: langConf.languages,
  react: {
    wait: false,
  },
};

i18n.use(backend);

module.exports = { i18n, i18nOptions };
