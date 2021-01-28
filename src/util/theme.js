const stylus = require("stylus");
const path = require("path");
const { writeFileSync, unlinkSync } = require("fs");

/** Migrate v3 themes to v4 */
const migrateTheme = (theme) => {
  if (!theme.id) {
    let id;

    switch (theme.name) {
      case "Default":
        id = "default";
        break;
      case "Dark":
        id = "dark";
        break;
      case "Dark Plus":
        id = "dark-plus";
        break;
    }

    return {
      ...theme,
      id,
    };
  } else {
    return theme;
  }
};

const themePresets = {
  dark: { bg: "#1f232a", fg: "#eeeeee", ac: "#7289da" },
  darkMint: { bg: "#10151E", fg: "#eeeeee", ac: "#40C486" },
  purplish: { bg: "#15192E", fg: "#eeeeee", ac: "#125DBF" },
};

const compileTheme = async (options, userDataPath) => {
  try {
    let tempMetaPath = path.join(userDataPath, "temp_metadata.styl");
    let baseTheme = await fetch(
      "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/wa.user.styl"
    );
    baseTheme = await baseTheme.text();
    let metadata = await fetch(
      "https://raw.githubusercontent.com/vednoc/dark-whatsapp/master/metadata.styl"
    );
    metadata = await metadata.text();
    let customizedMetadata = customizeMetadata(metadata, options);
    writeFileSync(tempMetaPath, customizedMetadata);
    let theme = customizeTheme(baseTheme, tempMetaPath);
    unlinkSync(tempMetaPath);
    return theme;
  } catch (err) {
    console.error(err);
  }
};

/**
 * Customize the theme
 * @param {string} theme Theme CSS
 */
const customizeTheme = (theme, metaPath) => {
  let customized;

  stylus(theme)
    .import(metaPath)
    .render((err, css) => {
      if (err) {
        console.error(err);
        return;
      } else {
        customized = css
          .slice(0, -3)
          .substring(css.indexOf("@moz"))
          .replace(/@-moz.*\{/, "");
      }
    });

  return customized;
};

/**
 * Customize theme metadata before compilation
 * @param {string} current Current CSS
 * @param {object} options Theme options
 */
const customizeMetadata = (current, options) => {
  let metadata;

  metadata = current.replace("theme = 'old'", "theme = 'custom'");
  metadata = metadata.replace("fullscreen = 0", "fullscreen = 1");

  let opts = {
    _bg: options && options.bg ? options.bg : "#1f232a",
    _fg: options && options.fg ? options.fg : "#eee",
    _ac: options && options.ac ? options.ac : "#7289da",
  };

  for (let key of Object.keys(opts)) {
    let regex = new RegExp(`${key} = (.*)`);
    metadata = metadata.replace(regex, `${key} = ${opts[key]}`);
  }

  return metadata;
};

export {
  customizeTheme,
  customizeMetadata,
  compileTheme,
  themePresets,
  migrateTheme,
};
