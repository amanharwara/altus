const usercss_meta = require("usercss-meta");
const stylus = require("stylus");

/**
 * Generate theme from options
 * @param {Object} opt Theme options
 * @param {string} [opt.bg] New background
 * @param {string} [opt.fg] New foreground/text color
 * @param {string} [opt.ac] New accent color
 * @param {string} style Fetched userstyle if available
 * @returns {string} Generated CSS
 */
function generateTheme(opt, style) {
  let next_bg = opt && opt.bg ? opt.bg : "#1f232a";
  let next_fg = opt && opt.fg ? opt.fg : "#eee";
  let next_ac = opt && opt.ac ? opt.ac : "#7289da";

  let css;
  if (style && style.length > 0) {
    css = style;
  } else {
    throw new Error("No userstyle provided.");
  }

  let metadata = css.substring(0, css.indexOf("== */") + 5);

  css = css.substring(css.indexOf("== */") + 5, css.length - 1);

  let parsed_metadata = usercss_meta.parse(metadata).metadata;

  let {
    vars
  } = parsed_metadata;

  let new_metadata_string = "";

  for (let k in vars) {
    let current = vars[k];
    if (k === "theme") current.default = "'custom'";
    if (k === "alerts") current.default = "'show'";
    if (k === "app_image") current.default = "'bg-high'";
    if (k === "next_bg") current.default = next_bg;
    if (k === "next_fg") current.default = next_fg;
    if (k === "next_ac") current.default = next_ac;
    new_metadata_string = `${k} = ${current.default !== null ? current.default : current}${current.units ? current.units : ""}\n` + new_metadata_string;
  }

  css = new_metadata_string + css;

  let new_css = "";

  stylus.render(css, (e, css) => {
    if (e) console.error(e);
    new_css = css.replace(/.*\n/, "").slice(0, -3);
  });

  return new_css;
}

module.exports = {
  generateTheme,
};