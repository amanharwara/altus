const fs = require('fs-extra')
const {
    chdir
} = require('process')
const path = require('path')

const exec = require('./lib').exec

const escapeStringRegexp = require('escape-string-regexp');

module.exports = async function(context) {
    if (!context.artifactPaths[0].toLowerCase().endsWith('appimage')) {
        return;
    }

    if (/^win/i.test(process.platform)) {
        return
    }

    const originalDir = process.cwd()

    const dirname = context.outDir;
    chdir(dirname);

    const packageDir = 'squashfs-root';

    let downloaded = false;
    const appimagetool = 'appimagetool';

    for (let artifact of context.artifactPaths) {
        if (artifact.toLowerCase().endsWith('appimage')) {
            if (downloaded === false) {
                await exec(
                    "curl", [
                        "--fail",
                        "--location",
                        "--output", appimagetool,
                        `https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage`,
                    ],
                );
                await exec("chmod", ["+x", appimagetool]);
                downloaded = true
            }
            artifact = artifact.replace(/(\s+)/g, '\\$1')
            await exec('rm', ['-rf', packageDir])
            await exec(artifact, ['--appimage-extract'])
            const shFile = path.join(packageDir, "./AppRun");
            const shContentOriginal = fs.readFileSync(shFile).toString();
            const searchValue = `exec "$BIN"`;
            const replaceWith = `${searchValue} --no-sandbox`;
            let count = 0;
            const content = shContentOriginal.replace(
                new RegExp(escapeStringRegexp(searchValue), "g"),
                () => (count++, replaceWith),
            );
            if (content === shContentOriginal || count !== 2) {
                throw new Error(`Failed to patch content of the "${shFile}" file`);
            }
            fs.writeFileSync(shFile, content);
            const uploadArtifact = artifact.replace(/ /g, '-')
            await exec(dirname + '/' + appimagetool, [
                '-n',
                '--comp',
                'xz',
                packageDir,
                uploadArtifact,
            ])
        }
    }

    await exec('find', [
        `-iname "* *.AppImage"`,
        `-delete`
    ])

    chdir(originalDir)
}