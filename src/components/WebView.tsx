import { type Component, onMount } from "solid-js";
import { type Tab } from "../stores/tabs/common";
import { WebviewTag } from "electron";

const WebView: Component<{ tab: Tab }> = (props) => {
  const { tab } = props;

  let webviewRef: WebviewTag | undefined;

  onMount(() => {
    const webview = webviewRef;

    if (!webview) {
      return;
    }

    webview.addEventListener("dom-ready", () => {
      //
    });

    webview.addEventListener("ipc-message", (event) => {
      console.log(event);
    });
  });

  return (
    <webview
      ref={webviewRef}
      class="w-full h-full"
      id={`webview-${tab.id}`}
      src="https://web.whatsapp.com"
      partition={`persist:${tab.id}`}
      preload={window.whatsappPreloadPath}
    />
  );
};

export default WebView;
