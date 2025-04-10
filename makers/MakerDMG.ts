import { MakerBase, MakerOptions } from "@electron-forge/maker-base";
import path from "path";
import fs from "fs-extra";
import { buildForge } from "app-builder-lib";
import { CommonConfig } from "./CommonConfig";

export default class MakerDMG extends MakerBase<MakerOptions> {
  name = "dmg";
  defaultPlatforms: string[] = ["darwin", "mas"];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === "darwin";
  }

  async make(options: MakerOptions): Promise<string[]> {
    const { makeDir, targetArch, forgeConfig, appName } = options;
    const executableName = forgeConfig.packagerConfig.executableName || appName;

    const outPath = path.resolve(makeDir, `dmg`);
    const tmpPath = path.resolve(makeDir, `dmg/${targetArch}-tmp`);
    const result: Array<string> = [];

    await fs.emptyDir(tmpPath);
    await fs.emptyDir(outPath);

    await fs.copy(
      path.resolve(options.dir, "Altus.app"),
      path.resolve(tmpPath, "Altus.app")
    );

    const assets = path.resolve(__dirname, "..", "public", "assets");
    const icons = path.resolve(assets, "icons");

    const output = await buildForge(
      { dir: tmpPath },
      {
        mac: [`dmg:${options.targetArch}`],
        config: {
          ...CommonConfig,
          icon: path.resolve(icons, "icon.png"),
          mac: {
            executableName,
            category: "public.app-category.social-networking",
            target: "dmg",
            icon: path.resolve(icons, "icon.icns"),
          },
          dmg: {
            icon: path.resolve(icons, "icon.icns"),
            iconSize: 100,
            format: "ULFO",
          },
          publish: null,
        },
      }
    );

    for (const file of output) {
      const filePath = path.resolve(makeDir, path.basename(file));
      result.push(filePath);

      if (fs.existsSync(filePath)) {
        await fs.remove(filePath);
      }

      await fs.move(file, filePath);
    }

    await fs.remove(tmpPath);
    await fs.remove(outPath);
    await fs.remove(path.resolve(makeDir, "dmg/make"));

    return result;
  }
}
