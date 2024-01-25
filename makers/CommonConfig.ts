import { Configuration } from "app-builder-lib";

export const CommonConfig: Partial<Configuration> = {
  appId: "harwara.aman.altus",
  productName: "Altus",
  protocols: [
    {
      name: "whatsapp",
      role: "Viewer",
      schemes: ["whatsapp"],
    },
  ],
};
