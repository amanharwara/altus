import type { Config } from "tailwindcss";
import kobalte from "@kobalte/tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}",
  ],
  theme: {
    extend: {},
  },
  plugins: [kobalte],
};

export default config;
