import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import path from "path";
import fs from "fs-extra";
import debug from "debug";
import { buildForge } from "app-builder-lib";

const log = debug("electron-forge:maker:nsis");

export default class MakerNSIS extends MakerBase<MakerOptions> {
  name = "nsis";

  defaultPlatforms: string[] = ["win32"];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === "win32";
  }

  async make(options: MakerOptions): Promise<string[]> {
    const { makeDir, targetArch } = options;
    const outPath = path.resolve(makeDir, `nsis/${targetArch}`);
    const tmpPath = path.resolve(makeDir, `nsis/${targetArch}-tmp`);
    const result: Array<string> = [];

    log(`Emptying directories: ${tmpPath}, ${outPath}`);
    await fs.emptyDir(tmpPath);
    await fs.emptyDir(outPath);
    log(`Copying contents of ${options.dir} to ${tmpPath}`);
    await fs.copy(options.dir, tmpPath);

    log(`Calling app-builder-lib's buildForge() with ${tmpPath}`);
    const output = await buildForge(
      { dir: tmpPath },
      {
        win: [`nsis:${options.targetArch}`],
        config: {
          icon: path.resolve(
            __dirname,
            "..",
            "src",
            "icons",
            "app",
            "icon.ico"
          ),
          nsis: {
            oneClick: false,
            installerSidebar: path.resolve(
              __dirname,
              "..",
              "public",
              "assets",
              "installerSidebar.bmp"
            ),
            artifactName: "${productName}-Setup-${version}.${ext}",
            allowToChangeInstallationDirectory: true,
          },
        },
      }
    );

    log("Received output files", output);
    for (const file of output) {
      const filePath = path.resolve(outPath, path.basename(file));
      result.push(filePath);

      await fs.move(file, filePath);
    }

    await fs.remove(tmpPath);
    await fs.remove(path.resolve(makeDir, "nsis/make"));

    return result;
  }
}
