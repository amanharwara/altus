import { MakerBase, MakerOptions } from "@electron-forge/maker-base";
import path from "path";
import fs from "fs-extra";
import { buildForge } from "app-builder-lib";
import { CommonConfig } from "./CommonConfig";

export default class MakerAppImage extends MakerBase<MakerOptions> {
  name = "appImage";

  defaultPlatforms: string[] = ["linux"];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === "linux";
  }

  async make(options: MakerOptions): Promise<string[]> {
    const { makeDir, targetArch, forgeConfig, appName, packageJSON } = options;
    const executableName = forgeConfig.packagerConfig.executableName || appName;

    const outPath = path.resolve(makeDir, `appImage`);
    const tmpPath = path.resolve(makeDir, `appImage/${targetArch}-tmp`);
    const result: Array<string> = [];

    await fs.emptyDir(tmpPath);
    await fs.emptyDir(outPath);
    await fs.copy(options.dir, tmpPath);

    const output = await buildForge(
      { dir: tmpPath },
      {
        linux: [`appImage:${options.targetArch}`],
        config: {
          ...CommonConfig,
          icon: path.resolve(
            __dirname,
            "..",
            "public",
            "assets",
            "icons",
            "icon.png"
          ),
          linux: {
            executableName,
            desktop: {
              Name: appName,
              Terminal: "false",
              Type: "Application",
              Icon: executableName,
              StartUpWMClass: "Altus",
              "X-AppImage-Version": packageJSON.version,
              Comment: packageJSON.description,
              Categories: ["Network", "InstantMessaging"],
            },
          },
          appImage: {},
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
    await fs.remove(path.resolve(makeDir, "appImage/make"));

    return result;
  }
}
