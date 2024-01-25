import type { ForgeConfig } from "@electron-forge/shared-types";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { MakerDMG } from "@electron-forge/maker-dmg";
import MakerAppImage from "./makers/MakerAppImage";
import MakerNSIS from "./makers/MakerNSIS";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/assets/icons/icon",
    appBundleId: "harwara.aman.altus",
    appCategoryType: "public.app-category.social-networking",
    protocols: [
      {
        name: "whatsapp",
        schemes: ["whatsapp"],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerAppImage(),
    new MakerDMG({
      icon: "./public/assets/icons/icon.icns",
      format: "ULFO",
    }),
    new MakerNSIS(),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
        },
        {
          entry: "src/whatsapp.preload.ts",
          config: "vite.whatsapp.preload.config.ts",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
  ],
};

export default config;
