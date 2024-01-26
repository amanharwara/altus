// Add <webview> tag support to JSX

import { type WebviewTag } from "electron";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      webview: Partial<WebviewTag> & {
        class?: string;
        ref?: WebviewTag | ((el: WebviewTag) => void);
      };
    }
  }
}
