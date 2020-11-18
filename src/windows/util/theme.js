const stylus = require("stylus");

/**
 * Customize the theme
 * @param {string} theme
 */
function customizeTheme(theme, metaPath, noLog) {
  let customized;

  stylus(theme)
    .import(metaPath)
    .render((err, css) => {
      if (err) {
        console.error(err);
        return;
      } else {
        if (!noLog) console.log(css);
        customized = css
          .slice(0, -3)
          .substring(css.indexOf("@moz"))
          .replace(/@-moz.*\{/, "");
      }
    });

  return customized;
}

function customizeMetadata(current, options) {
  console.log("meta custom start");
  let metadata;

  metadata = current.replace("theme = 'old'", "theme = 'custom'");
  metadata = current.replace("fullscreen = 0", "fullscreen = 1");

  let opts = {
    _bg: options && options.bg ? options.bg : "#1f232a",
    _fg: options && options.fg ? options.fg : "#eee",
    _ac: options && options.ac ? options.ac : "#7289da",
  };

  for (let key of Object.keys(opts)) {
    let regex = new RegExp(`${key} = (.*)`);
    metadata = metadata.replace(regex, `${key} = ${opts[key]}`);
    console.log(`${key} has now the value ${opts[key]}`);
  }

  return metadata;
}

module.exports = {
  customizeTheme,
  customizeMetadata,
};
