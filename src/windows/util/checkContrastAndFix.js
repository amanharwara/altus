const Color = require("color");

/**
 * Check if colors have enough contrast and fix them if they don't.
 * @param {Color} bg Background color
 * @param {Color} fg Foreground color
 */
function checkContrastAndFix(bg, fg) {
    bg = new Color(bg);
    fg = new Color(fg);
    if (bg.contrast(fg) > 5) {
        return fg;
    } else {
        let i = 0;
        while (bg.contrast(fg) < 7) {
            if (fg.hex() === '#000000') fg = Color('#040404');

            let lighten_by = 0.5;
            let darken_by = 0.5;

            if (fg.isDark()) {
                fg = fg.lighten(lighten_by + i);
            } else {
                fg = fg.darken(darken_by + i);
            }

            i += 1;
        }
        return fg;
    }
}

module.exports = {
    checkContrastAndFix,
};